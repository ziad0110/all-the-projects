import { useState } from 'react';

interface LayerInfo {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
}

const layersData: LayerInfo[] = [
  {
    id: 1,
    name: 'الطبقة الخارجية',
    description: 'قماش ناعم ومسامي يسمح بتبادل الهواء ويمنع التهيج',
    color: '#8BD7EF',
    icon: '🌬️'
  },
  {
    id: 2,
    name: 'طبقة الحماية',
    description: 'حاجز مقاوم للماء يمنع التسرب ويحافظ على جفاف البشرة',
    color: '#C4E0A3',
    icon: '🛡️'
  },
  {
    id: 3,
    name: 'الطبقة الماصة',
    description: 'تقنية فائقة الامتصاص تحبس الرطوبة بعيداً عن بشرة الطفل',
    color: '#E84B8A',
    icon: '💧'
  },
  {
    id: 4,
    name: 'الطبقة الداخلية',
    description: 'نسيج فائق النعومة يحافظ على راحة طفلك طوال اليوم',
    color: '#E46E6E',
    icon: '🤍'
  }
];

interface FlipCardProps {
  layer: LayerInfo;
  index: number;
  isFlipped: boolean;
  onFlip: () => void;
}

function FlipCard({ layer, index, isFlipped, onFlip }: FlipCardProps) {
  return (
    <div
      className="relative w-full h-64 cursor-pointer perspective-1000"
      onClick={onFlip}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''
          }`}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl shadow-xl flex flex-col items-center justify-center p-6"
          style={{
            backgroundColor: layer.color,
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="text-6xl mb-4">{layer.icon}</div>
          <h3 className="text-xl font-bold text-white text-center" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {layer.name}
          </h3>
          <p className="text-white/80 text-sm mt-2 text-center">
            اضغط للتفاصيل
          </p>
          <div
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold"
          >
            {index + 1}
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 rotate-y-180"
          style={{
            backgroundColor: 'white',
            border: `3px solid ${layer.color}`,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4"
            style={{ backgroundColor: layer.color + '20' }}
          >
            {layer.icon}
          </div>
          <h3 className="text-lg font-bold text-gray-800 text-center mb-3" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {layer.name}
          </h3>
          <p className="text-gray-600 text-sm text-center leading-relaxed">
            {layer.description}
          </p>
          <div
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: layer.color }}
          >
            طبقة {index + 1}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DiaperLayersProps {
  scrollProgress?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function DiaperLayers({ scrollProgress: _scrollProgress }: DiaperLayersProps) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const handleFlip = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            طبقات الحفاضة
          </h2>
          <p className="text-gray-300 text-lg">
            اضغط على أي بطاقة لمعرفة المزيد عن كل طبقة
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {layersData.map((layer, index) => (
            <FlipCard
              key={layer.id}
              layer={layer}
              index={index}
              isFlipped={flippedCards.has(index)}
              onFlip={() => handleFlip(index)}
            />
          ))}
        </div>

        {/* Layer Order Indicator */}
        <div className="mt-12 flex justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-wrap justify-center gap-4">
            {layersData.map((layer) => (
              <div
                key={layer.id}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="text-white text-sm font-medium">
                  {layer.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
