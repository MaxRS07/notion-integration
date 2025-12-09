interface DestinationPreviewProps {
    name: string;
    description: string;
    onClear: () => void;
    isActive: boolean;
    placeholderName: string;
    placeholderDescription: string;
}

const DestinationPreview: React.FC<DestinationPreviewProps> = ({
    name,
    description,
    onClear,
    isActive,
    placeholderName,
    placeholderDescription,
}) => (
    <div className="selected-destination" style={{ flex: 1, opacity: isActive ? 1 : 0.5 }}>
        <div className="destination-preview">
            {isActive ? (
                <>
                    <div className="destination-info">
                        <div className="destination-name">{name}</div>
                        <div className="destination-type">{description}</div>
                    </div>
                    <button className="button-icon" style={{ color: '#fff' }} onClick={onClear}>
                        ✕
                    </button>
                </>
            ) : (
                <div className="destination-info">
                    <div className="destination-name" style={{ color: '#888' }}>{placeholderName}</div>
                    <div className="destination-type">{placeholderDescription}</div>
                </div>
            )}
        </div>
    </div>
);
export default DestinationPreview;