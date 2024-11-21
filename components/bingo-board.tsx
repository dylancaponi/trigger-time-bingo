import React, { useState, useRef } from 'react';
import { Shuffle, Save, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export const BingoBoard = () => {
  const [squares, setSquares] = useState(Array(25).fill(''));
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
        } catch (error) {
          alert('Error loading board: Please select a valid JSON file created by the Bingo Board Generator.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Custom Bingo Board</CardTitle>
        <div className="flex gap-2">
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
                ${index === 12 ? 'bg-gray-100' : ''}
                ${currentEdit === index ? 'border-blue-500' : ''}
              `}
            >
              {currentEdit === index ? (
                <Input
                  autoFocus
                  value={text}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className="w-full h-full text-center"
                />
              ) : (
                <span className="text-center text-sm break-words">
                  {text}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};