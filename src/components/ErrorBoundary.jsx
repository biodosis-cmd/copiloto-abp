import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-red-100 rounded-full text-red-600">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-red-800">Algo salió mal en esta sección</h3>
                    <p className="text-sm text-red-600 max-w-md">
                        {this.state.error?.message || "Error desconocido"}
                    </p>
                    <Button
                        onClick={this.handleReset}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Intentar de nuevo
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
