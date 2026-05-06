'use client';

import { useState } from 'react';
import { Trade, Direction, TradeImage } from '@/lib/types';
import { calculatePnL, getPnLTextColor, formatPnL } from '@/lib/pnl-calculator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Info, X } from 'lucide-react';
import { getQualityColor, getQualityLabel } from '@/lib/quality-utils';
import { ImageUpload } from '@/components/images/image-upload';
import { ImageGallery } from '@/components/images/image-gallery';

interface TradeModalProps {
  date: string;
  initialTrade?: Trade;
  onSave: (trade: Trade) => Promise<void>;
  onClose: () => void;
}

const INDICES = ['NIFTY', 'SENSEX', 'Other'];

export function TradeModal({ date, initialTrade, onSave, onClose }: TradeModalProps) {
  const [formData, setFormData] = useState({
    index: initialTrade?.index || 'SPY',
    direction: initialTrade?.direction || ('buy' as Direction),
    entryPrice: initialTrade?.entryPrice?.toString() || '',
    exitPrice: initialTrade?.exitPrice?.toString() || '',
    executionQuality: initialTrade?.executionQuality || 5,
    notes: initialTrade?.notes || '',
  });

  const [images, setImages] = useState<TradeImage[]>(initialTrade?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageIds] = useState<Set<string>>(
    new Set(initialTrade?.images?.map((img) => img.id) || [])
  );

  // Calculate live P&L
  const entryPrice = parseFloat(formData.entryPrice);
  const exitPrice = parseFloat(formData.exitPrice);
  const livePnL =
    !isNaN(entryPrice) && !isNaN(exitPrice)
      ? calculatePnL(formData.direction, entryPrice, exitPrice)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const entryPriceValue = parseFloat(formData.entryPrice);
      const exitPriceValue = parseFloat(formData.exitPrice);

      if (isNaN(entryPriceValue) || formData.entryPrice.trim() === '') {
        setError('Entry Price is required');
        return;
      }

      if (isNaN(exitPriceValue) || formData.exitPrice.trim() === '') {
        setError('Exit Price is required');
        return;
      }

      if (entryPriceValue <= 0 || exitPriceValue <= 0) {
        setError('Prices must be greater than 0');
        return;
      }

      if (formData.executionQuality < 1 || formData.executionQuality > 10) {
        setError('Execution Quality must be between 1 and 10');
        return;
      }

      setIsSubmitting(true);

      const calculatedPnL = calculatePnL(formData.direction, entryPriceValue, exitPriceValue);

      const trade: Trade = {
        id: initialTrade?.id || `${date}-${Date.now()}`,
        date,
        index: formData.index,
        direction: formData.direction,
        entryPrice: entryPriceValue,
        exitPrice: exitPriceValue,
        pnl: calculatedPnL,
        executionQuality: formData.executionQuality,
        notes: formData.notes,
        images: images.length > 0 ? images : undefined,
        createdAt: initialTrade?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      await onSave(trade);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trade');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl bg-card animate-in scale-in duration-300 flex flex-col max-h-[90vh]">
        {/* Fixed Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-border bg-card">
          <h2 className="text-2xl font-bold text-foreground">
            {initialTrade ? 'Edit Trade' : 'Add New Trade'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <form id="trade-form" onSubmit={handleSubmit} className="space-y-6 p-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-100 border border-red-300 text-red-900 text-sm">
                {error}
              </div>
            )}

            {/* Index Selection */}
            <div className="space-y-2">
              <Label htmlFor="index" className="text-sm font-medium">
                Index/Symbol
              </Label>
              <select
                id="index"
                value={formData.index}
                onChange={(e) => setFormData({ ...formData, index: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {INDICES.map((idx) => (
                  <option key={idx} value={idx}>
                    {idx}
                  </option>
                ))}
              </select>
            </div>

            {/* Direction Toggle */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Trade Type</Label>
              <div className="flex gap-2">
                {(['buy', 'sell'] as const).map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => setFormData({ ...formData, direction: dir })}
                    className={cn(
                      'flex-1 py-3 px-4 rounded-lg font-semibold border-2 text-white transition-all',
                      formData.direction === dir
                        ? dir === 'buy'
                          ? 'bg-green-600 border-green-700'
                          : 'bg-red-600 border-red-700'
                        : 'bg-muted text-muted-foreground border-border'
                    )}
                  >
                    {dir === 'buy' ? 'BUY' : 'SELL'}
                  </button>
                ))}
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryPrice" className="text-sm font-medium">
                  Entry Price
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="entryPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exitPrice" className="text-sm font-medium">
                  Exit Price
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="exitPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.exitPrice}
                    onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            {/* P&L Display */}
            {livePnL !== null && (
              <div
                className={cn(
                  'p-4 rounded-lg border-2 text-center',
                  livePnL > 0
                    ? 'bg-green-50 border-green-300'
                    : livePnL < 0
                    ? 'bg-red-50 border-red-300'
                    : 'bg-slate-50 border-slate-300'
                )}
              >
                <p className="text-xs text-muted-foreground mb-1">Profit & Loss</p>
                <p className={cn('text-2xl font-bold', getPnLTextColor(livePnL))}>
                  {formatPnL(livePnL)}
                </p>
              </div>
            )}

            {/* Execution Quality - Slider (1-10) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Execution Quality
                </Label>
                <div className={cn(
                  'px-3 py-1 rounded-md font-semibold text-sm',
                  'bg-slate-100',
                  getQualityColor(formData.executionQuality)
                )}>
                  {formData.executionQuality}/10 - {getQualityLabel(formData.executionQuality)}
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.executionQuality}
                onChange={(e) => setFormData({ ...formData, executionQuality: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, rgb(248,113,113) 0%, rgb(251,191,36) 30%, rgb(251,191,36) 60%, rgb(34,197,94) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Poor (1-3)</span>
                <span>Average (4-6)</span>
                <span>Good (7-10)</span>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Trade Images (Optional)
              </Label>
              <div className="border border-border rounded-lg p-4 bg-muted/30">
                <ImageUpload
                  images={images}
                  onImagesAdd={(newImages) => {
                    newImages.forEach((img) => uploadedImageIds.add(img.id));
                    setImages([...images, ...newImages]);
                  }}
                  onImageRemove={async (imageId) => {
                    // Delete orphaned image if it was just uploaded (not from initial trade)
                    if (uploadedImageIds.has(imageId) && !initialTrade?.images?.find((img) => img.id === imageId)) {
                      try {
                        const imageToRemove = images.find((img) => img.id === imageId);
                        if (imageToRemove?.imagePath) {
                          await fetch('/api/storage/delete-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ date, imageName: imageToRemove.imagePath }),
                          });
                        }
                      } catch (err) {
                        console.error('[Error] Failed to delete orphaned image:', err);
                      }
                    }
                    setImages(images.filter((img) => img.id !== imageId));
                  }}
                  date={date}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Trade notes..."
                className="min-h-24 resize-none"
              />
            </div>

          </form>
        </div>

        {/* Sticky Footer with Actions */}
        <div className="flex-shrink-0 border-t border-border bg-card p-6 flex gap-3">
          <Button type="submit" form="trade-form" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Saving...' : 'Save Trade'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
