import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import './PosterEditor.css';

interface PosterEditorProps {
    onSave?: (canvasData: any) => void;
    initialData?: any;
}

const PosterEditor = ({ onSave, initialData }: PosterEditorProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [selectedTool, setSelectedTool] = useState<string>('select');
    const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);

    useEffect(() => {
        if (canvasRef.current && !canvas) {
            const fabricCanvas = new fabric.Canvas(canvasRef.current, {
                width: 794, // A4 width in pixels at 96 DPI
                height: 1123, // A4 height in pixels at 96 DPI
                backgroundColor: '#ffffff'
            });

            // Load initial data if provided
            if (initialData) {
                fabricCanvas.loadFromJSON(initialData, () => {
                    fabricCanvas.renderAll();
                });
            }

            // Selection event
            fabricCanvas.on('selection:created', (e) => {
                setSelectedObject(e.selected?.[0] || null);
            });

            fabricCanvas.on('selection:updated', (e) => {
                setSelectedObject(e.selected?.[0] || null);
            });

            fabricCanvas.on('selection:cleared', () => {
                setSelectedObject(null);
            });

            setCanvas(fabricCanvas);

            return () => {
                fabricCanvas.dispose();
            };
        }
    }, []);

    // Tool Functions
    const addRectangle = () => {
        if (!canvas) return;
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            width: 150,
            height: 100,
            fill: '#FFB800',
            stroke: '#FF6B00',
            strokeWidth: 2
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
    };

    const addCircle = () => {
        if (!canvas) return;
        const circle = new fabric.Circle({
            left: 100,
            top: 100,
            radius: 50,
            fill: '#FF6B00',
            stroke: '#FFB800',
            strokeWidth: 2
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
    };

    const addTriangle = () => {
        if (!canvas) return;
        const triangle = new fabric.Triangle({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: '#FF9E5E'
        });
        canvas.add(triangle);
        canvas.setActiveObject(triangle);
    };

    const addStar = () => {
        if (!canvas) return;
        const points = [];
        const outerRadius = 50;
        const innerRadius = 25;
        for (let i = 0; i < 10; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI / 5) * i;
            points.push({
                x: radius * Math.sin(angle),
                y: -radius * Math.cos(angle)
            });
        }
        const star = new fabric.Polygon(points, {
            left: 100,
            top: 100,
            fill: '#FFB800'
        });
        canvas.add(star);
        canvas.setActiveObject(star);
    };

    const addText = () => {
        if (!canvas) return;
        const text = new fabric.IText('Double click to edit', {
            left: 100,
            top: 100,
            fontSize: 24,
            fill: '#2D3436',
            fontFamily: 'Outfit'
        });
        canvas.add(text);
        canvas.setActiveObject(text);
    };

    const addLine = () => {
        if (!canvas) return;
        const line = new fabric.Line([50, 100, 200, 100], {
            stroke: '#2D3436',
            strokeWidth: 3
        });
        canvas.add(line);
        canvas.setActiveObject(line);
    };

    const addImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file && canvas) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    fabric.Image.fromURL(event.target?.result as string, (img) => {
                        img.scaleToWidth(200);
                        canvas.add(img);
                        canvas.setActiveObject(img);
                    });
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const changeColor = (color: string) => {
        if (!selectedObject) return;
        selectedObject.set('fill', color);
        canvas?.renderAll();
    };

    const deleteSelected = () => {
        if (!selectedObject || !canvas) return;
        canvas.remove(selectedObject);
        setSelectedObject(null);
    };

    const exportCanvas = () => {
        if (!canvas) return;
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1
        });
        const link = document.createElement('a');
        link.download = 'poster.png';
        link.href = dataURL;
        link.click();
    };

    const saveCanvas = () => {
        if (!canvas || !onSave) return;
        const data = canvas.toJSON();
        onSave(data);
    };

    return (
        <div className="poster-editor-container">
            {/* Top Toolbar */}
            <div className="editor-toolbar-top">
                <div className="toolbar-section">
                    <button className="tool-btn" onClick={() => canvas?.undo?.()} title="Undo">↶</button>
                    <button className="tool-btn" onClick={() => canvas?.redo?.()} title="Redo">↷</button>
                </div>
                <div className="toolbar-section">
                    <button className="tool-btn primary" onClick={saveCanvas}>💾 Save</button>
                    <button className="tool-btn" onClick={exportCanvas}>⬇️ Export PNG</button>
                </div>
            </div>

            <div className="editor-workspace">
                {/* Left Toolbar */}
                <div className="editor-sidebar-left">
                    <div className="tool-group">
                        <h4>Shapes</h4>
                        <button className="tool-icon-btn" onClick={addRectangle} title="Rectangle">
                            <div className="shape-preview rect"></div>
                        </button>
                        <button className="tool-icon-btn" onClick={addCircle} title="Circle">
                            <div className="shape-preview circle"></div>
                        </button>
                        <button className="tool-icon-btn" onClick={addTriangle} title="Triangle">
                            <div className="shape-preview triangle"></div>
                        </button>
                        <button className="tool-icon-btn" onClick={addStar} title="Star">⭐</button>
                        <button className="tool-icon-btn" onClick={addLine} title="Line">─</button>
                    </div>

                    <div className="tool-group">
                        <h4>Content</h4>
                        <button className="tool-icon-btn" onClick={addText} title="Add Text">
                            <strong>T</strong>
                        </button>
                        <button className="tool-icon-btn" onClick={addImage} title="Add Image">🖼️</button>
                    </div>

                    <div className="tool-group">
                        <h4>Actions</h4>
                        <button className="tool-icon-btn danger" onClick={deleteSelected} disabled={!selectedObject} title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="canvas-container">
                    <canvas ref={canvasRef} />
                </div>

                {/* Right Panel - Properties */}
                <div className="editor-sidebar-right">
                    {selectedObject ? (
                        <div className="properties-panel">
                            <h4>Properties</h4>
                            <div className="property-group">
                                <label>Fill Color</label>
                                <div className="color-picker-grid">
                                    <div className="color-swatch" style={{ background: '#FFB800' }} onClick={() => changeColor('#FFB800')}></div>
                                    <div className="color-swatch" style={{ background: '#FF6B00' }} onClick={() => changeColor('#FF6B00')}></div>
                                    <div className="color-swatch" style={{ background: '#FF9E5E' }} onClick={() => changeColor('#FF9E5E')}></div>
                                    <div className="color-swatch" style={{ background: '#2D3436' }} onClick={() => changeColor('#2D3436')}></div>
                                    <div className="color-swatch" style={{ background: '#FFFFFF' }} onClick={() => changeColor('#FFFFFF')}></div>
                                    <div className="color-swatch" style={{ background: '#6C5CE7' }} onClick={() => changeColor('#6C5CE7')}></div>
                                    <div className="color-swatch" style={{ background: '#00B894' }} onClick={() => changeColor('#00B894')}></div>
                                    <div className="color-swatch" style={{ background: '#FDCB6E' }} onClick={() => changeColor('#FDCB6E')}></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-selection">
                            <p>Select an element to edit properties</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PosterEditor;
