import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    WidthType,
    BorderStyle,
    ShadingType,
    TextRun,
    AlignmentType,
    VerticalAlign,
    HeightRule,
    HeadingLevel,
    Header,
    PageOrientation
} from "docx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { db } from "../db";

// ============================================================================
// CONSTANTES DE DISEÑO (Colores Escapados para DOCX)
// ============================================================================
const COLORS = {
    YELLOW_HEADER: "FFD966", // Asignaturas
    YELLOW_LIGHT: "FFF2CC",  // Problema / Lanzamiento
    GREEN_LIGHT: "E2EFDA",   // Oai / Desarrollar
    BLUE_LIGHT: "DDEBF7",    // Rais / Experimentar (boceto)
    BLUE_DARK: "BDD7EE",     // Experimentar (azul más fuerte)
    RED_LIGHT: "F4CCCC",     // HSXXI
    RED_BOLD: "FF6666",      // Publicar (Rojo fuerte)
    PURPLE: "E1D5E7",        // Producto final
    ORANGE: "FBE5D6",        // Pregunta Guía
    HEADER_GRAY: "F2F2F2",   // Encabezados tabla
    TEXT_BLACK: "000000"
};

const FONT_FAMILY = "Calibri";
const BORDER_STYLE = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: "000000"
};

// ============================================================================
// HELPERS
// ============================================================================


const parseRichText = (text, fontSize, bullet = false) => {
    if (!text) return [new Paragraph({})];
    text = String(text).replace(/\[|\]/g, "").replace(/INCLUYE:?/gi, "").trim();

    if (!text.includes("**")) {
        return [
            new Paragraph({
                bullet: bullet ? { level: 0 } : undefined,
                children: [
                    new TextRun({
                        text: text,
                        font: FONT_FAMILY,
                        size: fontSize,
                        color: COLORS.TEXT_BLACK,
                    }),
                ],
            })
        ];
    }

    return text.split('\n').map(line => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const children = parts.map(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return new TextRun({
                    text: part.slice(2, -2),
                    bold: true,
                    font: FONT_FAMILY,
                    size: fontSize,
                    color: COLORS.TEXT_BLACK,
                });
            }
            return new TextRun({
                text: part,
                bold: false,
                font: FONT_FAMILY,
                size: fontSize,
                color: COLORS.TEXT_BLACK,
            });
        }).filter(tr => tr);

        return new Paragraph({
            children,
            bullet: bullet ? { level: 0 } : undefined
        });
    });
};

const createCell = (content, options = {}) => {
    const {
        bold = false,
        shading = null,
        colSpan = 1,
        width = null,
        align = AlignmentType.LEFT,
        verticalAlign = VerticalAlign.CENTER,
        fontSize = 22,
        verticalMerge = null
    } = options;

    let children;
    if (Array.isArray(content)) {
        children = content.flatMap(item => parseRichText(String(item), fontSize, true));
    } else {
        children = bold
            ? [new Paragraph({
                alignment: align,
                children: [new TextRun({ text: String(content || ""), bold: true, font: FONT_FAMILY, size: fontSize, color: COLORS.TEXT_BLACK })]
            })]
            : parseRichText(String(content || ""), fontSize);

        if (!bold && !Array.isArray(content)) {
            children.forEach(p => {
                if (!p.root[1]) p.root[1] = {};
            });
        }
    }

    return new TableCell({
        width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
        columnSpan: colSpan,
        verticalMerge: verticalMerge,
        shading: shading ? { fill: shading, type: ShadingType.CLEAR, color: "auto" } : undefined,
        verticalAlign: verticalAlign,
        borders: {
            top: BORDER_STYLE,
            bottom: BORDER_STYLE,
            left: BORDER_STYLE,
            right: BORDER_STYLE,
        },
        children: children,
    });
};

// ============================================================================
// EXPORT TO DOCX (Standard Vertical)
// ============================================================================
export const exportToDocx = async (data) => {
    if (!data) return;
    const asignaturasText = Array.isArray(data.asignaturas) ? data.asignaturas.join(', ') : (data.asignaturas || "");
    const oaiList = (data.oai || []).map(o => typeof o === 'object' ? `**${o.asignatura}**: ${o.oa}` : o);
    const raiList = (data.rai || []);
    const hsxxiList = (data.hsxxi || []);
    const schoolName = data.nombre_colegio || "Escuela Roberto Ojeda Torres";

    const headerChildren = [
        new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
                new TextRun({ text: schoolName, font: FONT_FAMILY, size: 20, color: "666666" }),
                new TextRun({ text: "Unidad Técnico Pedagógica", font: FONT_FAMILY, size: 20, color: "666666", break: 1 }),
            ],
        })
    ];

    const doc = new Document({
        sections: [
            {
                properties: {},
                headers: {
                    default: new Header({
                        children: headerChildren,
                    }),
                },
                children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "MÁTRIX", bold: true, size: 28, font: FONT_FAMILY, allCaps: true })] }),
                    new Paragraph({ children: [new TextRun({ text: "PARTE 1", bold: true, size: 24, font: FONT_FAMILY })], spacing: { after: 200 } }),
                    new Paragraph({ children: [new TextRun({ text: "Nombre del proyecto: ", bold: true, size: 22, font: FONT_FAMILY }), new TextRun({ text: `“${data.nombre_proyecto}”`, bold: true, italics: true, size: 22, font: FONT_FAMILY })], spacing: { after: 300 } }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [createCell("1", { width: 5, shading: COLORS.YELLOW_HEADER, bold: true, align: AlignmentType.CENTER, verticalMerge: "restart" }), createCell("Asignaturas", { width: 20, shading: COLORS.YELLOW_HEADER, bold: true }), createCell(asignaturasText, { width: 75, bold: true })] }),
                            new TableRow({ children: [createCell("", { verticalMerge: "continue", shading: COLORS.YELLOW_HEADER }), createCell("Nivel/es", { shading: COLORS.YELLOW_HEADER, bold: true }), createCell(data.curso || "")] }),
                            new TableRow({ children: [createCell("", { verticalMerge: "continue", shading: COLORS.YELLOW_HEADER }), createCell("Duración", { shading: COLORS.YELLOW_HEADER, bold: true }), createCell(`${data.duracion || 0} semanas`)] }),
                            new TableRow({ children: [createCell("", { verticalMerge: "continue", shading: COLORS.YELLOW_HEADER }), createCell("Fecha de inicio", { shading: COLORS.YELLOW_HEADER, bold: true }), createCell(data.fecha_inicio || "A definir")] }),
                            new TableRow({ children: [createCell("2", { shading: COLORS.YELLOW_LIGHT, bold: true, align: AlignmentType.CENTER }), createCell("Problema", { shading: COLORS.YELLOW_LIGHT, bold: true }), createCell(data.problema || "", { align: AlignmentType.JUSTIFIED })] }),
                            new TableRow({ children: [createCell("3", { shading: COLORS.GREEN_LIGHT, bold: true, align: AlignmentType.CENTER }), createCell("Oai", { shading: COLORS.GREEN_LIGHT, bold: true }), createCell(oaiList, { align: AlignmentType.LEFT, fontSize: 18 })] }),
                            new TableRow({ children: [createCell("4", { shading: COLORS.BLUE_LIGHT, bold: true, align: AlignmentType.CENTER }), createCell("Rais", { shading: COLORS.BLUE_LIGHT, bold: true }), createCell(raiList, { align: AlignmentType.LEFT, fontSize: 18 })] }),
                            new TableRow({ children: [createCell("5", { shading: COLORS.RED_LIGHT, bold: true, align: AlignmentType.CENTER }), createCell("HSXXI", { shading: COLORS.RED_LIGHT, bold: true }), createCell(hsxxiList, { align: AlignmentType.LEFT, fontSize: 18 })] }),
                            new TableRow({ children: [createCell("6", { shading: COLORS.PURPLE, bold: true, align: AlignmentType.CENTER }), createCell("Producto final", { shading: COLORS.PURPLE, bold: true }), createCell(data.producto_final || "", { align: AlignmentType.LEFT })] }),
                            new TableRow({ children: [createCell("7", { shading: COLORS.ORANGE, bold: true, align: AlignmentType.CENTER }), createCell("Pregunta Guía", { shading: COLORS.ORANGE, bold: true }), createCell(data.pregunta_guia || "", { align: AlignmentType.LEFT })] }),
                        ],
                    }),
                    new Paragraph({ text: "", spacing: { after: 400 } }),
                    new Paragraph({ children: [new TextRun({ text: "PARTE 2", bold: true, size: 24, font: FONT_FAMILY })], spacing: { after: 200 } }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ tableHeader: true, children: [createCell("Fase", { bold: true, align: AlignmentType.CENTER, width: 15, shading: COLORS.HEADER_GRAY }), createCell("Semana", { bold: true, align: AlignmentType.CENTER, width: 5, shading: COLORS.HEADER_GRAY }), createCell("Actividades", { bold: true, align: AlignmentType.CENTER, width: 35, shading: COLORS.HEADER_GRAY }), createCell("Evaluación", { bold: true, align: AlignmentType.CENTER, width: 15, shading: COLORS.HEADER_GRAY }), createCell("Recursos", { bold: true, align: AlignmentType.CENTER, width: 15, shading: COLORS.HEADER_GRAY }), createCell("Producto intermedio", { bold: true, align: AlignmentType.CENTER, width: 15, shading: COLORS.HEADER_GRAY })] }),
                            ...(data.cronograma || []).map((row, index) => {
                                let faseColor = COLORS.YELLOW_LIGHT;
                                let phaseName = row.fase ? row.fase.toLowerCase() : "";
                                if (phaseName.includes("desarroll")) faseColor = COLORS.GREEN_LIGHT;
                                else if (phaseName.includes("experiment") || phaseName.includes("prototip")) faseColor = COLORS.BLUE_DARK;
                                else if (phaseName.includes("publicar") || phaseName.includes("cierre")) faseColor = COLORS.RED_BOLD;
                                return new TableRow({ children: [createCell(row.fase || "", { shading: faseColor, bold: true, align: AlignmentType.CENTER, fontSize: 18 }), createCell(String(row.semana || index + 1), { align: AlignmentType.CENTER }), createCell(row.actividades || "", { align: AlignmentType.LEFT, fontSize: 18 }), createCell(row.evaluacion || "", { fontSize: 18 }), createCell(row.recursos || "", { fontSize: 18 }), createCell(row.producto_intermedio || row.producto || "", { fontSize: 18 })] });
                            })
                        ]
                    })
                ]
            }
        ]
    });
    Packer.toBlob(doc).then((blob) => { saveAs(blob, `Planificacion_ABP_${data.nombre_proyecto || "Proyecto"}.docx`); });
};

// ============================================================================
// EXPORT TO DOCX (Horizontal / Landscape)
// ============================================================================
export const exportToDocxLandscape = async (data) => {
    if (!data) return;
    const asignaturasText = Array.isArray(data.asignaturas) ? data.asignaturas.join(', ') : (data.asignaturas || "");
    const oaiList = (data.oai || []).map(o => typeof o === 'object' ? `**${o.asignatura}**: ${o.oa}` : o);
    const raiList = (data.rai || []);
    const hsxxiList = (data.hsxxi || []);
    const schoolName = data.nombre_colegio || "Escuela Roberto Ojeda Torres";

    const headerChildren = [
        new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
                new TextRun({ text: schoolName, font: FONT_FAMILY, size: 20, color: "666666" }),
                new TextRun({ text: "Unidad Técnico Pedagógica", font: FONT_FAMILY, size: 20, color: "666666", break: 1 }),
            ],
        })
    ];

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: {
                            orientation: PageOrientation.LANDSCAPE
                        }
                    }
                },
                headers: {
                    default: new Header({
                        children: headerChildren,
                    }),
                },
                children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "MÁTRIX (HORIZONTAL)", bold: true, size: 28, font: FONT_FAMILY, allCaps: true })] }),
                    new Paragraph({ children: [new TextRun({ text: "Nombre del proyecto: ", bold: true, size: 22, font: FONT_FAMILY }), new TextRun({ text: `“${data.nombre_proyecto}”`, bold: true, italics: true, size: 22, font: FONT_FAMILY })], spacing: { after: 300 } }),

                    // Parte 1 (Contexto)
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [createCell("Asignaturas", { width: 20, shading: COLORS.YELLOW_HEADER, bold: true }), createCell(asignaturasText, { width: 80, bold: true })] }),
                            new TableRow({ children: [createCell("Curso & Fecha", { shading: COLORS.YELLOW_HEADER, bold: true }), createCell(`${data.curso} | ${data.duracion} semanas | Inicio: ${data.fecha_inicio || "A definir"}`)] }),
                            new TableRow({ children: [createCell("Problema", { shading: COLORS.YELLOW_LIGHT, bold: true }), createCell(data.problema || "", { align: AlignmentType.JUSTIFIED })] }),
                            new TableRow({ children: [createCell("Oai", { shading: COLORS.GREEN_LIGHT, bold: true }), createCell(oaiList, { align: AlignmentType.LEFT, fontSize: 18 })] }),
                            new TableRow({ children: [createCell("Rais", { shading: COLORS.BLUE_LIGHT, bold: true }), createCell(raiList, { align: AlignmentType.LEFT, fontSize: 18 })] }),
                            new TableRow({ children: [createCell("HSXXI", { shading: COLORS.RED_LIGHT, bold: true }), createCell(hsxxiList, { align: AlignmentType.LEFT, fontSize: 18 })] }),
                            new TableRow({ children: [createCell("Producto Final", { shading: COLORS.PURPLE, bold: true }), createCell(data.producto_final || "", { align: AlignmentType.LEFT })] }),
                        ],
                    }),

                    new Paragraph({ text: "", spacing: { after: 400 } }),

                    // Parte 2 (Cronograma)
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ tableHeader: true, children: [createCell("Fase", { bold: true, align: AlignmentType.CENTER, width: 15, shading: COLORS.HEADER_GRAY }), createCell("Sem", { bold: true, align: AlignmentType.CENTER, width: 5, shading: COLORS.HEADER_GRAY }), createCell("Actividades", { bold: true, align: AlignmentType.CENTER, width: 35, shading: COLORS.HEADER_GRAY }), createCell("Evaluación", { bold: true, align: AlignmentType.CENTER, width: 15, shading: COLORS.HEADER_GRAY }), createCell("Recursos", { bold: true, align: AlignmentType.CENTER, width: 15, shading: COLORS.HEADER_GRAY }), createCell("Producto", { bold: true, align: AlignmentType.CENTER, width: 15, shading: COLORS.HEADER_GRAY })] }),
                            ...(data.cronograma || []).map((row, index) => {
                                let faseColor = COLORS.YELLOW_LIGHT;
                                let phaseName = row.fase ? row.fase.toLowerCase() : "";
                                if (phaseName.includes("desarroll")) faseColor = COLORS.GREEN_LIGHT;
                                else if (phaseName.includes("experiment") || phaseName.includes("prototip")) faseColor = COLORS.BLUE_DARK;
                                else if (phaseName.includes("publicar") || phaseName.includes("cierre")) faseColor = COLORS.RED_BOLD;
                                return new TableRow({ children: [createCell(row.fase || "", { shading: faseColor, bold: true, align: AlignmentType.CENTER, fontSize: 18 }), createCell(String(row.semana || index + 1), { align: AlignmentType.CENTER }), createCell(row.actividades || "", { align: AlignmentType.LEFT, fontSize: 18 }), createCell(row.evaluacion || "", { fontSize: 18 }), createCell(row.recursos || "", { fontSize: 18 }), createCell(row.producto_intermedio || row.producto || "", { fontSize: 18 })] });
                            })
                        ]
                    })
                ]
            }
        ]
    });
    Packer.toBlob(doc).then((blob) => { saveAs(blob, `Planificacion_ABP_Landscape_${data.nombre_proyecto || "Proyecto"}.docx`); });
};

// ============================================================================
// PDF HELPER: SANITIZER
// ============================================================================
const clean = (text) => {
    if (!text) return "";
    let str = String(text);
    str = str.replace(/\*\*(.*?)\*\*/g, '$1');
    str = str.replace(/\[|\]/g, "");
    str = str.replace(/INCLUYE:?/gi, "");
    return str.trim();
};

// ============================================================================
// EXPORT TO PDF Option 1: LANDSCAPE EDUCATIONAL PRO
// ============================================================================
export const exportToPdfLandscape = async (data) => {
    if (!data) return;



    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const schoolName = data.nombre_colegio || "Escuela Roberto Ojeda Torres";

    const C = { PRIMARY: [15, 118, 110], SECONDARY: [51, 65, 85], ACCENT: [245, 158, 11], BG_HEADER: [241, 245, 249], WHITE: [255, 255, 255], LIGHT_BORDER: [226, 232, 240] };

    const addHeaderConf = () => ({
        didDrawPage: (opts) => {
            const p = opts.settings.margin.left;
            doc.setDrawColor(...C.PRIMARY); doc.setLineWidth(1.5);
            doc.line(p, 15, pageWidth - p, 15);

            doc.setFontSize(9); doc.setTextColor(...C.SECONDARY); doc.setFont("helvetica", "normal");
            doc.text(`${schoolName} | Unidad Técnico Pedagógica`, p, 12);

            doc.setFontSize(8);
            doc.text("Página " + doc.internal.getNumberOfPages(), pageWidth - p - 15, pageHeight - 10);
        }
    });

    let yPos = 25;
    doc.setFont("helvetica", "bold"); doc.setFontSize(24); doc.setTextColor(...C.PRIMARY);
    // Fix: Wrap title to prevent overflow
    const title = (data.nombre_proyecto || "PROYECTO S/N").toUpperCase();
    const titleLines = doc.splitTextToSize(title, pageWidth - (margin * 2));
    doc.text(titleLines, pageWidth / 2, yPos, { align: "center" });

    // Adjust yPos based on title lines (approx 10mm per line at size 24)
    yPos += (titleLines.length * 10) + 5;

    autoTable(doc, {
        startY: yPos, theme: 'plain',
        body: [
            [{ content: `NIVEL: ${data.curso || "?"}`, styles: { halign: 'center', fontStyle: 'bold' } }, { content: `DURACIÓN: ${data.duracion || 0} SEMANAS`, styles: { halign: 'center', fontStyle: 'bold' } }, { content: `INICIO: ${(data.fecha_inicio || "A DEFINIR").toUpperCase()}`, styles: { halign: 'center', fontStyle: 'bold' } }],
            [{ content: `ASIGNATURAS: ${(data.asignaturas || []).join(", ").toUpperCase()}`, colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', textColor: C.PRIMARY, fontSize: 11 } }]
        ],
        styles: { fillColor: C.BG_HEADER, textColor: C.SECONDARY, fontSize: 10, cellPadding: 3, lineColor: C.LIGHT_BORDER, lineWidth: 0.1 },
        columnStyles: { 0: { cellWidth: pageWidth / 3 - margin }, 1: { cellWidth: pageWidth / 3 - margin }, 2: { cellWidth: 'auto' } }
    });
    yPos = doc.lastAutoTable.finalY + 10;

    autoTable(doc, {
        startY: yPos, head: [[{ content: 'EL DESAFÍO (CONTEXTO)', colSpan: 3, styles: { halign: 'center', fillColor: C.PRIMARY, textColor: C.WHITE, fontStyle: 'bold' } }]],
        body: [[{ content: 'PROBLEMA O NECESIDAD', styles: { fontStyle: 'bold', fillColor: C.BG_HEADER, textColor: C.PRIMARY } }, { content: 'PREGUNTA GUÍA', styles: { fontStyle: 'bold', fillColor: C.BG_HEADER, textColor: C.PRIMARY } }, { content: 'PRODUCTO FINAL', styles: { fontStyle: 'bold', fillColor: C.BG_HEADER, textColor: C.PRIMARY } }], [clean(data.problema), clean(data.pregunta_guia), clean(data.producto_final)]],
        theme: 'grid', styles: { lineColor: C.LIGHT_BORDER, textColor: C.SECONDARY, fontSize: 10, cellPadding: 4, overflow: 'linebreak' },
        columnStyles: { 0: { cellWidth: (pageWidth - (margin * 2)) * 0.40 }, 1: { cellWidth: (pageWidth - (margin * 2)) * 0.30 }, 2: { cellWidth: (pageWidth - (margin * 2)) * 0.30 } },
        ...addHeaderConf()
    });
    yPos = doc.lastAutoTable.finalY + 10;

    const fmt = (items) => (items || []).map(i => `• ${clean(typeof i === 'object' ? `${i.asignatura}: ${i.oa}` : i)}`).join("\n\n");
    autoTable(doc, {
        startY: yPos, head: [[{ content: 'FUNDAMENTACIÓN CURRICULAR', colSpan: 3, styles: { halign: 'center', fillColor: C.PRIMARY, textColor: C.WHITE, fontStyle: 'bold' } }]],
        body: [[{ content: 'OBJETIVOS DE APRENDIZAJE (OA)', styles: { fontStyle: 'bold', fillColor: C.BG_HEADER, textColor: C.PRIMARY } }, { content: 'HABILIDADES SIGLO XXI', styles: { fontStyle: 'bold', fillColor: C.BG_HEADER, textColor: C.PRIMARY } }, { content: 'INDICADORES (RAIS)', styles: { fontStyle: 'bold', fillColor: C.BG_HEADER, textColor: C.PRIMARY } }], [fmt(data.oai), fmt(data.hsxxi), fmt(data.rai)]],
        theme: 'grid', styles: { lineColor: C.LIGHT_BORDER, textColor: C.SECONDARY, fontSize: 9, cellPadding: 4, valign: 'top' },
        columnStyles: { 0: { cellWidth: (pageWidth - (margin * 2)) / 3 }, 1: { cellWidth: (pageWidth - (margin * 2)) / 3 }, 2: { cellWidth: (pageWidth - (margin * 2)) / 3 } },
        rowPageBreak: 'auto', pageBreak: 'auto', ...addHeaderConf()
    });

    if (doc.internal.pageSize.getHeight() - doc.lastAutoTable.finalY < 60) { doc.addPage(); yPos = 25; } else { yPos = doc.lastAutoTable.finalY + 15; }
    autoTable(doc, {
        startY: yPos, head: [[{ content: 'RUTA DE APRENDIZAJE (CRONOGRAMA DETALLADO)', colSpan: 6, styles: { halign: 'center', fillColor: C.PRIMARY, textColor: C.WHITE, fontStyle: 'bold', fontSize: 12 } }], ['SEM', 'FASE', 'ACTIVIDADES', 'EVALUACIÓN', 'RECURSOS', 'PRODUCTO']],
        body: (data.cronograma || []).map(row => [{ content: String(row.semana), styles: { halign: 'center', fontStyle: 'bold' } }, { content: row.fase, styles: { fontStyle: 'bold', textColor: C.ACCENT } }, clean(row.actividades), clean(row.evaluacion), clean(row.recursos), clean(row.producto_intermedio || row.producto)]),
        theme: 'grid', headStyles: { fillColor: C.BG_HEADER, textColor: C.PRIMARY, fontSize: 9, fontStyle: 'bold', halign: 'center', lineColor: C.LIGHT_BORDER, lineWidth: 0.1 },
        bodyStyles: { textColor: C.SECONDARY, fontSize: 9, cellPadding: 3, lineColor: C.LIGHT_BORDER, valign: 'top' }, alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 25 }, 2: { cellWidth: 'auto' }, 3: { cellWidth: 35 }, 4: { cellWidth: 35 }, 5: { cellWidth: 35 } },
        rowPageBreak: 'auto', pageBreak: 'auto', showHead: 'everyPage', ...addHeaderConf()
    });
    doc.save(`Plan_ABP_Landscape_${data.nombre_proyecto || "Proyecto"}.pdf`);
};

// ============================================================================
// EXPORT TO PDF Option 2: VERTICAL MODERN CREATIVE
// ============================================================================
export const exportToPdfVertical = async (data) => {
    if (!data) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const schoolName = (data.nombre_colegio || "Escuela Roberto Ojeda Torres").toUpperCase();

    // --- PALETTE: SOBER PROFESSIONAL (NAVY / BRONZE / SLATE) ---
    const C = {
        DARK: [15, 23, 42],        // Slate 900 (Deep elegant dark)
        PURPLE: [71, 85, 105],     // Slate 600 (Subtle structure)
        PINK: [180, 83, 9],        // Amber 700 (Bronze/Gold accent - Sober)
        BG_SOFT: [248, 250, 252],  // Slate 50
        TEXT: [51, 65, 85],        // Slate 700
        WHITE: [255, 255, 255]
    };

    const addFooter = () => {
        const pCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Página ${i} de ${pCount} | ${data.nombre_proyecto || "Proyecto ABP"}`, pageWidth / 2, pageHeight - 10, { align: "center" });
        }
    };

    // --- HEADER CALCULATION ---
    const title = (data.nombre_proyecto || "PROYECTO").toUpperCase();

    // Fix: Set font size BEFORE calculation to ensure correct wrapping
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);

    const titleLines = doc.splitTextToSize(title, pageWidth - (margin * 2));
    const titleHeight = titleLines.length * 12; // Approx 12mm per line at size 26 to avoid overlap
    const headerHeight = 40 + titleHeight; // Base padding + title height

    // --- DRAW HEADER ---
    doc.setFillColor(...C.DARK);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...C.PINK);
    doc.text(`PLANIFICACIÓN ABP | ${schoolName}`, margin, 15);

    doc.setFontSize(26); doc.setTextColor(...C.WHITE);
    doc.text(titleLines, margin, 30);

    let yPos = headerHeight + 15;

    // --- OVERVIEW CARDS ---
    const drawCard = (label, val, x, w, color) => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(230);
        doc.roundedRect(x, yPos, w, 25, 2, 2, 'FD');
        doc.setFontSize(8); doc.setTextColor(100); doc.text(label, x + 5, yPos + 8);
        doc.setFontSize(11); doc.setTextColor(...color); doc.text(String(val), x + 5, yPos + 18);
    };

    const cardW = (pageWidth - (margin * 2) - 10) / 3;
    drawCard("CURSO", data.curso || "?", margin, cardW, C.PURPLE);
    drawCard("FECHA ESTIMADA", data.fecha_inicio || "A definir", margin + cardW + 5, cardW, C.PINK);
    drawCard("DURACIÓN", `${data.duracion || 0} Semanas`, margin + (cardW * 2) + 10, cardW, C.DARK);

    yPos += 35;

    // --- ASIGNATURAS (ADDED BACK) ---
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...C.PURPLE);
    doc.text("ASIGNATURAS:", margin, yPos);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...C.TEXT);
    const subjectsText = (data.asignaturas || []).join(", ");
    const splitSubjects = doc.splitTextToSize(subjectsText, pageWidth - margin - 45);
    doc.text(splitSubjects, margin + 35, yPos);
    yPos += (splitSubjects.length * 5) + 10;

    // --- CONTEXT ---
    doc.setFontSize(14); doc.setTextColor(...C.DARK); doc.text("Contexto del Desafío", margin, yPos);
    doc.setDrawColor(...C.PINK); doc.setLineWidth(1); doc.line(margin, yPos + 2, margin + 40, yPos + 2);
    yPos += 10;

    autoTable(doc, {
        startY: yPos,
        body: [
            [{ content: "PROBLEMA", styles: { fontStyle: 'bold', textColor: C.PURPLE } }, clean(data.problema)],
            [{ content: "PREGUNTA", styles: { fontStyle: 'bold', textColor: C.PURPLE } }, clean(data.pregunta_guia)],
            [{ content: "PRODUCTO", styles: { fontStyle: 'bold', textColor: C.PURPLE } }, clean(data.producto_final)]
        ],
        theme: 'grid',
        styles: { cellPadding: 5, fontSize: 10, lineColor: 240, textColor: C.TEXT },
        columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 'auto' } }
    });
    yPos = doc.lastAutoTable.finalY + 15;

    // --- CURRICULUM ---
    doc.setFontSize(14); doc.setTextColor(...C.DARK); doc.text("Fundamentos", margin, yPos);
    doc.setDrawColor(...C.PURPLE); doc.line(margin, yPos + 2, margin + 30, yPos + 2);
    yPos += 10;

    const fmt = (items) => (items || []).map(i => `• ${clean(typeof i === 'object' ? `${i.asignatura}: ${i.oa}` : i)}`).join("\n");
    autoTable(doc, {
        startY: yPos,
        head: [['OA', 'Habilidades', 'Indicadores']],
        body: [[fmt(data.oai), fmt(data.hsxxi), fmt(data.rai)]],
        theme: 'striped',
        headStyles: { fillColor: C.PURPLE, textColor: C.WHITE, fontStyle: 'bold' },
        styles: { fontSize: 8, overflow: 'linebreak', cellPadding: 3 },
    });

    // --- TIMELINE (VERTICAL FEED) ---
    // --- TIMELINE (VERTICAL FEED) ---
    // Check if we need a new page or can continue
    yPos = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : yPos + 15;

    if (yPos + 30 > pageHeight) { // Check if enough space for Header + Start
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(16); doc.setTextColor(...C.DARK); doc.text("Ruta de Aprendizaje", margin, yPos);
    yPos += 15;

    // Custom rendering for timeline
    (data.cronograma || []).forEach((row) => {
        // Avoid page break in middle of card
        if (yPos > pageHeight - 50) { doc.addPage(); yPos = 20; }

        let color = C.PURPLE;
        let phase = row.fase ? row.fase.toLowerCase() : "";
        if (phase.includes("desarroll")) color = C.PINK;

        // Time Marker
        doc.setFillColor(...color);
        doc.circle(margin + 4, yPos + 6, 3, 'F');
        doc.setFontSize(9); doc.setTextColor(...color); doc.text(`SEM ${row.semana}`, margin + 10, yPos + 9);

        // Content Box (timeline)
        doc.setDrawColor(230);
        doc.setLineWidth(0.5);

        // Calculate Line Height
        doc.setFontSize(11); doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(row.fase || "Fase", pageWidth - margin - 40);

        doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(...C.TEXT);
        const actLines = doc.splitTextToSize(clean(row.actividades), pageWidth - margin - 40);

        const cardH = 20 + (actLines.length * 5) + 20; // Title + Body + Footer

        // Vertical Line
        doc.setDrawColor(240); doc.setLineWidth(1);
        doc.line(margin + 4, yPos + 10, margin + 4, yPos + cardH);

        // Render Title
        doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...C.DARK);
        doc.text(titleLines, margin + 25, yPos + 6);

        // Render Body
        doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...C.TEXT);
        doc.text(actLines, margin + 25, yPos + 16);

        // Footer (Resources/Eval)
        let footerY = yPos + 16 + (actLines.length * 5) + 5;
        doc.setFontSize(8); doc.setTextColor(150);
        const meta = `EVALUACIÓN: ${clean(row.evaluacion).substring(0, 50)}... | RECURSOS: ${clean(row.recursos)}`;
        doc.text(meta, margin + 25, footerY);

        yPos += cardH + 5;
    });

    addFooter();
    doc.save(`Plan_ABP_Vertical_${data.nombre_proyecto || "Proyecto"}.pdf`);
};
// ============================================================================
// EXPORT RUBRIC TO DOCX
// ============================================================================
export const exportRubricToDocx = async (data, rubric) => {
    if (!rubric || !rubric.criterios) return;

    const schoolName = data.nombre_colegio || "Escuela Roberto Ojeda Torres";
    const title = (data.nombre_proyecto || "PROYECTO").toUpperCase();

    const headerChildren = [
        new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
                new TextRun({ text: schoolName, font: FONT_FAMILY, size: 20, color: "666666" }),
                new TextRun({ text: "Rúbrica de Evaluación", font: FONT_FAMILY, size: 20, color: "666666", break: 1 }),
            ],
        })
    ];

    // Create Table Header
    const tableHeaderRow = new TableRow({
        tableHeader: true,
        children: [
            createCell("Criterio y Peso", { bold: true, shading: COLORS.HEADER_GRAY, width: 20 }),
            createCell("Excelente (7.0)", { bold: true, shading: COLORS.BLUE_LIGHT, width: 20 }),
            createCell("Bueno (5.0 - 6.0)", { bold: true, shading: COLORS.GREEN_LIGHT, width: 20 }),
            createCell("Suficiente (4.0)", { bold: true, shading: COLORS.YELLOW_LIGHT, width: 20 }),
            createCell("Insuficiente (1.0 - 3.9)", { bold: true, shading: COLORS.RED_LIGHT, width: 20 }),
        ]
    });

    // Create Table Rows
    const tableRows = rubric.criterios.map(c => {
        return new TableRow({
            children: [
                createCell([c.nombre, `Peso: ${c.peso || "-"}`], { bold: true, width: 20 }),
                createCell(c.niveles.excelente || "-", { width: 20, fontSize: 18 }),
                createCell(c.niveles.bueno || "-", { width: 20, fontSize: 18 }),
                createCell(c.niveles.suficiente || "-", { width: 20, fontSize: 18 }),
                createCell(c.niveles.insuficiente || "-", { width: 20, fontSize: 18 }),
            ]
        });
    });

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: {
                            orientation: PageOrientation.LANDSCAPE
                        }
                    }
                },
                headers: {
                    default: new Header({
                        children: headerChildren,
                    }),
                },
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 300 },
                        children: [
                            new TextRun({ text: "RÚBRICA DE EVALUACIÓN", bold: true, size: 28, font: FONT_FAMILY }),
                            new TextRun({ text: `\nProyecto: ${title}`, bold: true, size: 24, font: FONT_FAMILY }),
                        ]
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [tableHeaderRow, ...tableRows],
                    })
                ]
            }
        ]
    });

    Packer.toBlob(doc).then((blob) => { saveAs(blob, `Rubrica_${data.nombre_proyecto || "Proyecto"}.docx`); });
};

// ============================================================================
// EXPORT INSTRUMENT TO DOCX (Class-by-Class)
// ============================================================================
export const exportInstrumentToDocx = async (data, instrument, claseIndex) => {
    if (!instrument || !instrument.items) return;

    const schoolName = data.nombre_colegio || "Escuela Roberto Ojeda Torres";
    const title = (data.nombre_proyecto || "PROYECTO").toUpperCase();
    const claseInfo = data.cronograma[claseIndex] || { fase: "Clase", activities: "" };

    const headerChildren = [
        new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
                new TextRun({ text: schoolName, font: FONT_FAMILY, size: 20, color: "666666" }),
                new TextRun({ text: "Instrumento de Evaluación", font: FONT_FAMILY, size: 20, color: "666666", break: 1 }),
            ],
        })
    ];

    // Create Content (Table for Rubrics, List for others)
    let contentNodes = [];

    if (instrument.tipo === 'rubrica' && instrument.items && instrument.items.length > 0) {
        // --- RUBRIC TABLE LOGIC ---
        // Assume all items have consistent level structure, take headers from the first item
        const firstItem = instrument.items[0];
        const levels = firstItem.niveles || [];

        // Header Row: Criterio | Nivel 1 | Nivel 2 | ...
        const headerRow = new TableRow({
            tableHeader: true,
            children: [
                createCell("Criterio / Indicador", { bold: true, shading: COLORS.HEADER_GRAY, width: 25 }),
                ...levels.map(l => createCell(l.nombre || "Nivel", { bold: true, shading: COLORS.BLUE_LIGHT, align: AlignmentType.CENTER }))
            ]
        });

        // Data Rows
        const rows = instrument.items.map(item => {
            return new TableRow({
                children: [
                    createCell(item.criterio || item.pregunta || "", { bold: true }),
                    ...(item.niveles || []).map(nivel => createCell(nivel.descripcion || "", { fontSize: 18 }))
                ]
            });
        });

        contentNodes = [
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [headerRow, ...rows],
            })
        ];

    } else {
        // --- STANDARD LIST LOGIC (Checklist, Quiz, Scale, Ticket) ---
        contentNodes = instrument.items.map((item, idx) => {
            const itemText = new Paragraph({
                spacing: { before: 200, after: 100 },
                children: [
                    // Handle 'criterio' or 'pregunta' property
                    new TextRun({ text: `${idx + 1}. ${item.pregunta || item.criterio}`, font: FONT_FAMILY, size: 22, bold: true })
                ]
            });

            let optionsNodes = [];

            if (instrument.tipo === 'quiz') {
                optionsNodes = (item.opciones || []).map((opt, optIdx) => {
                    const letters = ['a', 'b', 'c', 'd', 'e'];
                    return new Paragraph({
                        indent: { left: 720 },
                        children: [new TextRun({ text: `${letters[optIdx]}) ${opt}`, font: FONT_FAMILY, size: 20 })]
                    });
                });
            } else if (instrument.tipo === 'ticket') {
                optionsNodes = [
                    new Paragraph({ text: "___________________________________________________________________________________", spacing: { before: 100 } }),
                    new Paragraph({ text: "___________________________________________________________________________________", spacing: { before: 100 } })
                ];
            } else {
                // Checkboxes (Lista Cotejo / Escala / Standard)
                optionsNodes = (item.opciones || ["Sí", "No"]).map(opt => {
                    return new Paragraph({
                        indent: { left: 720 },
                        children: [new TextRun({ text: `[   ] ${opt}`, font: FONT_FAMILY, size: 20 })]
                    });
                });
            }

            return [itemText, ...optionsNodes];
        }).flat();
    }


    const doc = new Document({
        sections: [
            {
                properties: {},
                headers: {
                    default: new Header({
                        children: headerChildren,
                    }),
                },
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 },
                        children: [
                            new TextRun({ text: (instrument.titulo || "Evaluación").toUpperCase(), bold: true, size: 28, font: FONT_FAMILY }),
                        ]
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 300 },
                        children: [
                            new TextRun({ text: `Clase ${claseIndex + 1}: ${claseInfo.fase}`, bold: true, size: 22, font: FONT_FAMILY, color: "666666" }),
                        ]
                    }),

                    // Student Name Field
                    new Paragraph({
                        spacing: { after: 400 },
                        children: [
                            new TextRun({ text: "Nombre Estudiante: __________________________________________  Fecha: ____________", font: FONT_FAMILY, size: 22 })
                        ]
                    }),

                    // Instructions
                    new Paragraph({
                        spacing: { after: 200 },
                        children: [
                            new TextRun({ text: "Instrucciones: ", bold: true, font: FONT_FAMILY, size: 22 }),
                            new TextRun({ text: instrument.instrucciones || "Responde según lo solicitado.", font: FONT_FAMILY, size: 22 })
                        ]
                    }),

                    // Items
                    // Items
                    ...contentNodes
                ]
            }
        ]
    });

    Packer.toBlob(doc).then((blob) => { saveAs(blob, `Instrumento_C${claseIndex + 1}_${instrument.instrumento || "Eval"}.docx`); });
};
