import React, { useState, useRef, useEffect } from 'react';
import { Shuffle, Save, Upload, Play, PlusSquare, Settings2, Share, Cloud } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { getBoardIdFromUrl, updateUrlWithBoardId } from '@/lib/utils'

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

  const [isPlaying, setIsPlaying] = useState(false);
  const [triggeredSquares, setTriggeredSquares] = useState<Set<number>>(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [prizeLine, setPrizeLine] = useState('');
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);

  const prizes = [
    "Congratulations! You've witnessed peak family dysfunction! 🎭",
    "You won, but at what emotional cost? 🥲",
    "Victory! Your therapy sessions weren't in vain! 🧠",
    "Champion of chaos! Your coping mechanisms are unmatched! 🏆",
    "Winner! Maybe next time stay home and order takeout? 🥡",
    "Success! Time to schedule that therapy appointment! 📅",
    "You survived! But did you really win? 🤔",
    "First place in family drama bingo! Last place in peace of mind! 🎪",
    "Victory achieved! Your emotional damage is now complete! 🎯",
    "Winner winner... anxiety dinner! 🍽️"
  ];

  const checkForBingo = (triggered: Set<number>) => {
    // Pre-calculate possible winning combinations
    const winningCombos = [
      // Rows
      [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],
      // Columns
      [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],
      // Diagonals
      [0,6,12,18,24], [4,8,12,16,20]
    ];

    // Check if any winning combination is fully contained in triggered squares
    return winningCombos.some(combo => 
      combo.every(num => triggered.has(num))
    );
  };

  const handleSquareClick = (index: number) => {
    if (isPlaying) {
      setTriggeredSquares(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
          // Only check for bingo if we're adding a square and don't already have a win
          if (!hasWon && newSet.size >= 5) { // Only check if we have enough squares for a win
            if (checkForBingo(newSet)) {
              setHasWon(true);
              setPrizeLine(prizes[Math.floor(Math.random() * prizes.length)]);
            }
          }
        }
        return newSet;
      });
      return;
    }
    
    if (currentEdit !== null) return;
    setCurrentEdit(index);
    
    // Add a small delay to allow the keyboard to start appearing
    setTimeout(() => {
      const editOverlay = document.querySelector('[data-edit-overlay]');
      if (editOverlay) {
        editOverlay.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
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
    if (triggeredSquares.size > 0 || hasWon) {
      const confirmShuffle = window.confirm(
        "Shuffling the board will reset your current game progress. Are you sure you want to continue?"
      );
      if (!confirmShuffle) return;
    }
    
    // Reset game state
    setHasWon(false);
    setPrizeLine('');
    setTriggeredSquares(new Set());
    
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

  const saveBoard = async () => {
    try {
      // Use existing boardId from URL or create new one only if none exists
      const boardId = getBoardIdFromUrl() || currentBoardId || crypto.randomUUID()
      
      const response = await fetch('/api/board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId,
          squares
        })
      })
      
      if (!response.ok) throw new Error('Failed to save board')
      
      setCurrentBoardId(boardId) // Ensure currentBoardId is set
      return boardId
    } catch (error) {
      console.error('Error saving board:', error)
      throw error
    }
  }

  const loadBoard = async (boardId: string) => {
    try {
      const response = await fetch(`/api/board?id=${boardId}`)
      if (!response.ok) throw new Error('Failed to load board')
      
      const board = await response.json()
      if (board && board.squares) {
        setSquares(board.squares)
        setCurrentBoardId(boardId)
      }
    } catch (error) {
      console.error('Error loading board:', error)
      throw new Error('Failed to load board')
    }
  }

  const handleSave = async () => {
    try {
      const boardId = await saveBoard()
      // Only update URL if there isn't already a board ID
      if (!getBoardIdFromUrl()) {
        updateUrlWithBoardId(boardId)
      }
      return true // Return success instead of showing alert
    } catch (error) {
      console.error('Save failed:', error);
      throw error
    }
  }

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
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const editOverlay = document.querySelector('[data-edit-overlay]');
      
      const target = (e as TouchEvent).touches?.[0]?.target || (e as MouseEvent).target;
      
      if (currentEdit !== null && editOverlay && !editOverlay.contains(target as Node)) {
        setCurrentEdit(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
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

  const resetGame = () => {
    setTriggeredSquares(new Set());
    setHasWon(false);
    setPrizeLine('');
    setIsPlaying(false);
  };

  useEffect(() => {
    const boardId = getBoardIdFromUrl()
    if (boardId) {
      loadBoard(boardId)
    }
  }, []) // Load board on initial mount if ID exists

  const [showButtonText, setShowButtonText] = useState(true);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = buttonContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        // If container width is less than 400px, hide text
        // Adjust this threshold based on your needs
        setShowButtonText(entry.contentRect.width >= 400);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <Card className="w-full max-w-xl mx-auto px-2 sm:px-4 overflow-hidden">
      <CardHeader className="space-y-4">
        <div>
          <CardTitle>Trigger Time Bingo™</CardTitle>
          <p className="text-sm text-muted-foreground mt-1 italic">
            (aka Family Gathering Bingo)
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
        <div className="flex flex-col gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={loadFile}
            accept=".json"
            className="hidden"
            aria-label="Load bingo board from JSON file"
          />
          <a ref={downloadRef} className="hidden" />
          
          <div className="flex flex-wrap gap-2" ref={buttonContainerRef}>
            <Button
              onClick={async () => {
                try {
                  const boardId = await saveBoard()
                  // Only update URL if there isn't already a board ID
                  if (!getBoardIdFromUrl()) {
                    updateUrlWithBoardId(boardId)
                  }
                  
                  if (navigator.share) {
                    navigator.share({
                      title: 'Trigger Time Bingo',
                      text: 'Ready to turn family drama into a game?',
                      url: window.location.href
                    }).catch(() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('URL copied to clipboard!\n\nNote: Shared boards expire after 7 days. Use Advanced → Save to File for permanent storage.');
                    });
                  } else {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('URL copied to clipboard!\n\nNote: Shared boards expire after 7 days. Use Advanced → Save to File for permanent storage.');
                  }
                } catch (error) {
                  console.error('Error:', error);
                  alert('Failed to share board: ' + (error instanceof Error ? error.message : String(error)));
                }
              }}
              className="flex items-center gap-2 h-10"
              style={{ width: showButtonText ? 'auto' : '2.5rem' }}
              title="Save & Share"
            >
              <Share className="w-4 h-4" />
              {showButtonText && <span>Save & Share</span>}
            </Button>

            <Button
              onClick={shuffleBoard}
              className="flex items-center gap-2 h-10"
              style={{ width: showButtonText ? 'auto' : '2.5rem' }}
              disabled={isPlaying}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
              {showButtonText && <span>Shuffle</span>}
            </Button>

            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 h-10"
              style={{ width: showButtonText ? 'auto' : '2.5rem' }}
              variant={isPlaying ? "destructive" : "default"}
              title={isPlaying ? 'Stop' : 'Play'}
            >
              {isPlaying ? <PlusSquare className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {showButtonText && <span>{isPlaying ? 'Stop' : 'Play'}</span>}
            </Button>

            <div className="relative ml-auto">
              <Button 
                variant="outline"
                size="icon"
                className="w-10 h-10"
                onClick={() => setShowAdvanced(!showAdvanced)}
                aria-label="Advanced options"
                disabled={isPlaying}
              >
                <Settings2 className="w-4 h-4" />
              </Button>

              {showAdvanced && (
                <div className="absolute top-full right-0 mt-1 bg-white border rounded-md shadow-lg py-1 min-w-[150px] z-50">
                  <button 
                    onClick={() => {
                      if (window.confirm('This will clear all squares and create a new board. Are you sure?')) {
                        // Create empty squares array with FREE SPACE in center
                        const emptySquares = Array(25).fill('').map((_, index) => 
                          index === 12 ? 'FREE SPACE' : ''
                        );
                        setSquares(emptySquares);
                        setCurrentBoardId(null); // Reset board ID to force new one on save
                        setTriggeredSquares(new Set()); // Reset any game progress
                        setHasWon(false);
                        setPrizeLine('');
                        
                        // Clear the board ID from URL
                        const url = new URL(window.location.href);
                        url.searchParams.delete('board');
                        window.history.pushState({}, '', url);
                      }
                      setShowAdvanced(false);
                    }}
                    disabled={isPlaying}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <PlusSquare className="w-4 h-4" />
                    New Board
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        await handleSave();
                        alert('Board saved successfully!\n\nNote: Shared boards expire after 7 days. Use Advanced → Save to File for permanent storage.');
                      } catch (error) {
                        console.error('Save failed:', error);
                        alert('Failed to save board: ' + (error instanceof Error ? error.message : String(error)));
                      }
                      setShowAdvanced(false);
                    }}
                    disabled={isPlaying}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Cloud className="w-4 h-4" />
                    Save to Cloud
                  </button>
                  <button 
                    onClick={() => {
                      const boardData = JSON.stringify(squares, null, 2);
                      const blob = new Blob([boardData], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'bingo-board.json';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      setShowAdvanced(false);
                    }}
                    disabled={isPlaying}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save to File
                  </button>
                  <button 
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAdvanced(false);
                    }}
                    disabled={isPlaying}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    Load File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
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
                relative
                ${index === 12 ? 'bg-gray-100' : ''}
                ${currentEdit === index ? 'opacity-0' : ''}
                ${isPlaying && triggeredSquares.has(index) ? 'border-red-500' : ''}
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
                {!isPlaying && (
                  <div className="absolute bottom-1 w-full text-[8px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                    Click to edit
                  </div>
                )}
                {triggeredSquares.has(index) && (
                  <div className={`
                    absolute inset-0 flex items-center justify-center
                    transition-opacity duration-200
                    ${isPlaying ? 'opacity-100 bg-red-100/80 z-10' : 'opacity-0 pointer-events-none'}
                  `}>
                    <div className="transform rotate-[-35deg] text-red-600 font-bold text-lg sm:text-xl border-2 border-red-600 px-2 py-1">
                      TRIGGERED!
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 z-[2] border-2 border-blue-500 bg-blue-50 shadow-lg flex items-center justify-center"
              data-edit-overlay
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: currentEdit !== null 
                  ? 'translate(-50%, -50%) scale(1)'
                  : 'translate(-50%, -50%) scale(0)',
                opacity: currentEdit !== null ? 1 : 0,
                zIndex: 1000,
                width: '80%',
                height: '80%',
                transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
                transformOrigin: 'center',
                visibility: currentEdit !== null ? 'visible' : 'hidden',
                pointerEvents: currentEdit !== null ? 'auto' : 'none',
                WebkitTransform: currentEdit !== null 
                  ? 'translate(-50%, -50%) scale(1)'
                  : 'translate(-50%, -50%) scale(0)',
                WebkitTransition: '-webkit-transform 0.2s ease-out, opacity 0.2s ease-out',
              }}
            >
              {currentEdit !== null && (
                <textarea
                  autoFocus
                  value={squares[currentEdit]}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  className={getTextStyles()}
                  style={{
                    wordBreak: 'keep-all',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    width: '100%',
                    height: '100%',
                    fontSize: '24px',
                    lineHeight: '1.2',
                  }}
                  onFocus={(e) => e.target.select()}
                />
              )}
            </div>
        </div>

        {hasWon && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 animate-fadeIn">
            <div className="text-center animate-slideDown">
              <h2 className="text-6xl font-bold text-yellow-400 mb-4 animate-pulse">
                BINGO!
              </h2>
              <p className="text-white text-xl mb-6">{prizeLine}</p>
              <Button 
                onClick={resetGame}
                variant="secondary"
              >
                Play Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};