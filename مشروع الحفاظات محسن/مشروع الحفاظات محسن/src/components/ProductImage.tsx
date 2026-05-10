interface ProductImageProps {
    category: string;
    color: string;
    size?: string;
    image?: string;
    className?: string;
}

export default function ProductImage({ category, color, size, image, className = '' }: ProductImageProps) {
    if (image) {
        return (
            <div className={`relative overflow-hidden rounded-2xl ${className}`}>
                <img
                    src={image}
                    alt={category}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </div>
        );
    }

    if (category === 'حفاضات') {
        return (
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                {/* Diaper body */}
                <ellipse cx="100" cy="110" rx="65" ry="50" fill={color} opacity="0.15" />
                <path d="M50 90 C50 65, 75 45, 100 45 C125 45, 150 65, 150 90 L145 140 C145 155, 130 165, 100 165 C70 165, 55 155, 55 140 Z" fill="white" stroke={color} strokeWidth="2.5" />
                {/* Tabs */}
                <path d="M55 85 L40 95 L45 110 L58 105" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />
                <path d="M145 85 L160 95 L155 110 L142 105" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />
                {/* Inner pattern */}
                <ellipse cx="100" cy="100" rx="35" ry="25" fill={color} opacity="0.08" />
                {/* Crown logo */}
                <path d="M85 80 L90 68 L95 76 L100 64 L105 76 L110 68 L115 80 Z" fill="#E84B8A" stroke="#E84B8A" strokeWidth="1" />
                <rect x="85" y="80" width="30" height="6" rx="2" fill="#E84B8A" opacity="0.8" />
                {/* Stars */}
                <circle cx="90" cy="100" r="2" fill={color} opacity="0.4" />
                <circle cx="100" cy="95" r="2" fill={color} opacity="0.4" />
                <circle cx="110" cy="100" r="2" fill={color} opacity="0.4" />
                {/* Size label */}
                {size && (
                    <>
                        <circle cx="100" cy="130" r="14" fill={color} opacity="0.2" />
                        <text x="100" y="135" textAnchor="middle" fontSize="14" fontWeight="bold" fill={color}>{size}</text>
                    </>
                )}
            </svg>
        );
    }

    if (category === 'مناديل') {
        return (
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                {/* Package body */}
                <rect x="45" y="55" width="110" height="90" rx="12" fill="white" stroke={color} strokeWidth="2.5" />
                <rect x="45" y="55" width="110" height="30" rx="12" fill={color} opacity="0.15" />
                {/* Opening flap */}
                <path d="M75 55 C75 45, 85 38, 100 38 C115 38, 125 45, 125 55" fill="white" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
                {/* Tissue coming out */}
                <path d="M85 55 C85 42, 90 35, 100 32 C110 35, 115 42, 115 55" fill={color} opacity="0.1" stroke={color} strokeWidth="1.5" />
                {/* Crown logo */}
                <path d="M88 78 L92 70 L96 75 L100 67 L104 75 L108 70 L112 78 Z" fill="#E84B8A" />
                <rect x="88" y="78" width="24" height="4" rx="1" fill="#E84B8A" opacity="0.8" />
                {/* Label lines */}
                <rect x="70" y="95" width="60" height="3" rx="1.5" fill={color} opacity="0.2" />
                <rect x="80" y="102" width="40" height="3" rx="1.5" fill={color} opacity="0.15" />
                {/* Droplet icons */}
                <path d="M60 120 C60 115, 65 110, 65 115 C65 120, 60 125, 60 120Z" fill={color} opacity="0.3" />
                <path d="M140 120 C140 115, 145 110, 145 115 C145 120, 140 125, 140 120Z" fill={color} opacity="0.3" />
                {/* Bottom stripe */}
                <rect x="45" y="130" width="110" height="15" rx="0 0 12 12" fill={color} opacity="0.1" />
            </svg>
        );
    }

    // Skincare / Cream
    return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Tube body */}
            <rect x="70" y="60" width="60" height="100" rx="10" fill="white" stroke={color} strokeWidth="2.5" />
            {/* Cap */}
            <rect x="80" y="45" width="40" height="20" rx="6" fill={color} opacity="0.8" />
            <rect x="85" y="40" width="30" height="10" rx="4" fill={color} />
            {/* Crown logo */}
            <path d="M88 90 L92 82 L96 87 L100 79 L104 87 L108 82 L112 90 Z" fill="#E84B8A" />
            <rect x="88" y="90" width="24" height="4" rx="1" fill="#E84B8A" opacity="0.8" />
            {/* Label */}
            <rect x="78" y="105" width="44" height="3" rx="1.5" fill={color} opacity="0.2" />
            <rect x="83" y="112" width="34" height="3" rx="1.5" fill={color} opacity="0.15" />
            {/* Decorative circles */}
            <circle cx="85" cy="130" r="4" fill={color} opacity="0.15" />
            <circle cx="100" cy="135" r="3" fill={color} opacity="0.1" />
            <circle cx="115" cy="130" r="4" fill={color} opacity="0.15" />
            {/* Sparkle */}
            <path d="M140 70 L142 65 L144 70 L149 72 L144 74 L142 79 L140 74 L135 72Z" fill="#E84B8A" opacity="0.5" />
            <path d="M55 85 L57 80 L59 85 L64 87 L59 89 L57 94 L55 89 L50 87Z" fill={color} opacity="0.3" />
        </svg>
    );
}
