import { useState } from 'react';
import './PresentationMode.css';

interface Step {
    id: string;
    text: string;
    image?: string;
}

interface PresentationModeProps {
    title: string;
    description: string;
    steps: Step[];
    onClose: () => void;
}

const PresentationMode = ({ title, description, steps, onClose }: PresentationModeProps) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Slide 0: Title Slide
    // Slide 1 to N: Process Steps
    // Slide N+1: Conclusion/QR Code
    const totalSlides = steps.length + 2;

    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) setCurrentSlide(prev => prev + 1);
    };

    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
    };

    const renderSlide = () => {
        if (currentSlide === 0) {
            return (
                <div className="slide title-slide animate-in">
                    <div className="label">PROJECT CASE STUDY</div>
                    <h1>{title}</h1>
                    <p className="description">{description}</p>
                    <div className="maker-footer">
                        <span>MAKER IDENTIFIED</span>
                        <div className="dots"></div>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            );
        }

        if (currentSlide <= steps.length) {
            const step = steps[currentSlide - 1];
            return (
                <div className="slide step-slide animate-in" key={step.id}>
                    <div className="slide-content-grid">
                        <div className="slide-image-container">
                            {step.image ? (
                                <img src={step.image} alt={`Step ${currentSlide}`} />
                            ) : (
                                <div className="image-placeholder">No Photo for Step {currentSlide}</div>
                            )}
                        </div>
                        <div className="slide-text-container">
                            <div className="step-badge">STEP {currentSlide}</div>
                            <p className="step-text">{step.text}</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="slide conclusion-slide animate-in">
                <h1>Thanks for watching!</h1>
                <p>Scan to see the full documentation or leave a comment.</p>
                <div className="qr-box">QR CODE</div>
                <button className="btn-primary" onClick={onClose}>Finish Presentation</button>
            </div>
        );
    };

    return (
        <div className="presentation-overlay">
            <button className="close-btn" onClick={onClose}>✕ Close</button>

            <div className="presentation-viewport">
                {renderSlide()}
            </div>

            <div className="presentation-controls">
                <button className="nav-btn" onClick={prevSlide} disabled={currentSlide === 0}>← Previous</button>
                <div className="slide-progress">
                    {Array.from({ length: totalSlides }).map((_, i) => (
                        <div key={i} className={`progress-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)}></div>
                    ))}
                </div>
                <button className="nav-btn" onClick={nextSlide} disabled={currentSlide === totalSlides - 1}>Next →</button>
            </div>
        </div>
    );
};

export default PresentationMode;
