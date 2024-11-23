import React, { useState, useRef, useEffect } from 'react';
import { Shuffle, Save, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export const BingoBoard = () => {
  const defaultSquares = [
    "So... getting married soon?",
    "Political argument at dinner",
    "Unsolicited parenting advice",
    "The bathtub story again",
    "'You've lost/gained weight!'",
    "Drama over who hosts next year",
    "Passive aggressive compliment",
    "Food critic strikes",
    "'Back in my day...'",
    "Phone at dinner",
    "Awkward relationship question",
    "Diet talk",
    "FREE SPACE", // center square
    "Someone's late (again)",
    "Outdated career advice",
    "Kids running wild",
    "Someone falls asleep on couch",
    "'When are you having kids?'",
    "Old family drama resurfaces",
    "Backhanded compliment",
    "Someone takes too many photos",
    "Surprise dietary restriction",
    "'You should visit more often'",
    "Weather small talk",
    "Someone mentions the will",
  ];

  const [squares, setSquares] = useState(defaultSquares);

  const [currentEdit, setCurrentEdit] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const textRefs = useRef<Array<HTMLDivElement | null>>([]);

  const handleSquareClick = (index: number) => {
    setCurrentEdit(index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newSquares = [...squares];
    if (currentEdit !== null) {
      newSquares[currentEdit] = e.target.value;
      setSquares(newSquares);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      if (currentEdit !== null) {
        // First set current to null to trigger animation out
        setCurrentEdit(null);
        
        // Then set new index after a brief delay to allow animation
        const nextIndex = (currentEdit + 1) % 25;
        setTimeout(() => {
          setCurrentEdit(nextIndex);
        }, 200); // Match this with your animation duration
      }
    } else if (e.key === 'Escape') {
      setCurrentEdit(null);
    }
  };

  const handleInputBlur = () => {
    setCurrentEdit(null);
  };

  const shuffleBoard = () => {
    const newSquares = [...squares];
    const centerValue = newSquares[12];
    const toShuffle = [...newSquares.slice(0, 12), ...newSquares.slice(13)];
    
    for (let i = toShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [toShuffle[i], toShuffle[j]] = [toShuffle[j], toShuffle[i]];
    }
    
    const result = [
      ...toShuffle.slice(0, 12),
      centerValue,
      ...toShuffle.slice(12)
    ];
    
    setSquares(result);
  };

  const saveBoard = () => {
    const data = JSON.stringify(squares, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    if (downloadRef.current) {
      downloadRef.current.href = url;
      downloadRef.current.download = 'bingo-board.json';
      downloadRef.current.click();
    }
    URL.revokeObjectURL(url);
  };

  const loadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const loadedSquares = JSON.parse(result);
            if (Array.isArray(loadedSquares) && loadedSquares.length === 25) {
              setSquares(loadedSquares);
            } else {
              alert('Invalid board format. File must contain exactly 25 squares.');
            }
          }
        } catch {
          alert('Error loading board: Please select a valid JSON file created by the Bingo Board Generator.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const getTextStyles = () => {
    return `
      text-center resize-none border-none 
      focus:outline-none bg-transparent
      whitespace-pre-wrap break-words
      overflow-hidden
      w-full h-full
      flex items-center justify-center
      p-2
    `;
  };

  const adjustFontSize = (index: number) => {
    const textElement = textRefs.current[index];
    if (textElement) {
      let fontSize = 16; // Start with a base font size
      textElement.style.fontSize = `${fontSize}px`;

      while (
        (textElement.scrollWidth > textElement.clientWidth || 
         textElement.scrollHeight > textElement.clientHeight) && 
        fontSize > 8 // Minimum font size
      ) {
        fontSize -= 0.5;
        textElement.style.fontSize = `${fontSize}px`;
      }
    }
  };

  useEffect(() => {
    squares.forEach((_, index) => adjustFontSize(index));
  }, [squares, currentEdit]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Get the edit overlay element
      const editOverlay = document.querySelector('[data-edit-overlay]');
      
      // Only close if the click is outside the edit overlay
      if (currentEdit !== null && editOverlay && !editOverlay.contains(e.target as Node)) {
        setCurrentEdit(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentEdit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentEdit !== null) {
        setCurrentEdit(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentEdit]);

  return (
    <Card className="w-full max-w-xl mx-auto px-2 sm:px-4 overflow-hidden">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle>Family Gathering Bingo</CardTitle>
          <p className="text-sm text-muted-foreground mt-1 italic">
            (aka Trigger Time Bingo™)
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Click any square to customize it with your own family&apos;s quirks!
          </p>
        </div>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Get together with your peers (fellow sufferers? kindred spirits?) and fill in the squares with
            family gathering moments you&apos;re almost certain will happen - from predictable comments about your
            life choices to that one relative&apos;s infamous story they tell every year. Shuffle, print a unique
            board for each player, and may the most observant cousin win!
          </p>
          <div className="space-y-2">
            <p>
              <strong>How to play:</strong> Game begins when the first guest arrives. First player to complete
              a horizontal, vertical, or diagonal line wins...
            </p>
            <div className="border-b-2 border-dashed border-gray-300 py-1 px-2">
              {/* Empty line for prize */}
            </div>
            <div className="text-xs italic">
              Prize suggestions:
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Choose the seating arrangement at the next gathering</li>
                <li>Exemption from dish duty</li>
                <li>First dibs on leftovers</li>
                <li>One &quot;family emergency&quot; escape card for next gathering</li>
                <li>Pick the restaurant for the next cousin meetup</li>
                <li>Custody of grandma&apos;s secret recipe</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={loadFile}
            accept=".json"
            className="hidden"
            aria-label="Load bingo board from JSON file"
          />
          <a 
            ref={downloadRef} 
            className="hidden"
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
            title="Load a previously saved bingo board (JSON file)"
          >
            <Upload className="w-4 h-4" />
            Load
          </Button>
          <Button 
            onClick={saveBoard}
            className="flex items-center gap-2"
            title="Save current bingo board to a JSON file"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button 
            onClick={shuffleBoard}
            className="flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Shuffle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 aspect-square w-full mx-auto relative">
          {squares.map((text, index) => (
            <div
              key={index}
              onClick={() => handleSquareClick(index)}
              className={`
                aspect-square border-2 border-gray-300 
                flex items-center justify-center
                cursor-pointer hover:border-blue-500
                p-0.5 sm:p-1
                transition-all duration-300
                ${index === 12 ? 'bg-gray-100' : ''}
                ${currentEdit === index ? 'opacity-0' : ''}
              `}
            >
              <div className="w-full h-full relative group">
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <div 
                    ref={(el: HTMLDivElement | null) => {
                      textRefs.current[index] = el;
                    }}
                    className={`
                      ${getTextStyles()}
                      text-gray-500 hover:text-gray-800 transition-colors
                      leading-tight
                    `}
                    style={{
                      wordBreak: 'keep-all',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {text}
                  </div>
                </div>
                <div className="absolute bottom-1 w-full text-[8px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                  Click to edit
                </div>
              </div>
            </div>
          ))}
          <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 z-10 border-2 border-blue-500 bg-blue-50 shadow-lg flex items-center justify-center pointer-events-none"
              data-edit-overlay
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${currentEdit !== null ? 1 : 0})`,
                opacity: currentEdit !== null ? 1 : 0,
                zIndex: 1000,
                width: '80%',
                height: '80%',
                transition: 'all 0.2s ease-out',
                transformOrigin: 'center',
                visibility: currentEdit !== null ? 'visible' : 'hidden',
                pointerEvents: currentEdit !== null ? 'auto' : 'none',
              }}
            >
              {currentEdit !== null && (
                <textarea
                  autoFocus
                  value={squares[currentEdit]}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  className={`
                    ${getTextStyles()}
                    text-[min(6vw, 24px)] leading-tight
                  `}
                  style={{
                    wordBreak: 'keep-all',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    width: '100%',
                    height: '100%',
                  }}
                />
              )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};