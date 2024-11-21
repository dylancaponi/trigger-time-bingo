import React, { useState, useRef, useEffect } from 'react';
import { Shuffle, Save, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

  const handleSquareClick = (index: number) => {
    setCurrentEdit(index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSquares = [...squares];
    if (currentEdit !== null) {
      newSquares[currentEdit] = e.target.value;
      setSquares(newSquares);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      if (currentEdit !== null) {
        const nextIndex = (currentEdit + 1) % 25;
        setCurrentEdit(nextIndex);
      }
    }
  };

  const handleInputBlur = () => {
    if (!document.activeElement?.classList.contains('bingo-input')) {
      setCurrentEdit(null);
    }
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

  const getFontSize = (text: string) => {
    console.log('Text content:', text); // Debug log
    if (text.length > 100) return 'text-[10px]';
    if (text.length > 50) return 'text-[12px]';
    return 'text-[14px]';
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle>Family Gathering Bingo</CardTitle>
          <p className="text-sm text-muted-foreground mt-1 italic">
            (aka Trigger Time Bingo™)
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Click any square to customize it with your own family's quirks!
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
        <div className="grid grid-cols-5 gap-2">
          {squares.map((text, index) => (
            <div
              key={index}
              onClick={() => handleSquareClick(index)}
              className={`
                aspect-square border-2 border-gray-300 
                flex items-center justify-center p-1
                cursor-pointer hover:border-blue-500
                min-h-[80px] min-w-[80px]
                ${index === 12 ? 'bg-gray-100' : ''}
                ${currentEdit === index ? 'border-blue-500 bg-blue-50 shadow-sm' : ''}
              `}
            >
              {currentEdit === index ? (
                <textarea
                  autoFocus
                  value={text}
                  onChange={(e) => handleInputChange(e as any)}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  className={`w-full h-full text-center resize-none border-none focus:outline-none bg-transparent ${getFontSize(text)}`}
                  style={{
                    lineHeight: '1.2',
                    padding: '4px',
                  }}
                />
              ) : (
                <span className="text-center break-words text-gray-500 hover:text-gray-800 transition-colors group h-full flex flex-col relative">
                  <div className="flex-1 flex items-center justify-center">
                    <div className={`leading-tight ${getFontSize(text)} max-w-full px-1`}>
                      {text}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 w-full">
                    Click to edit
                  </div>
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};