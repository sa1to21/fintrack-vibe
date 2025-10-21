import React, { useState } from 'react';
import './DonateDialog.css';

interface DonateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DonationMethod {
  label: string;
  value: string;
}

const DonateDialog: React.FC<DonateDialogProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const donationMethods: DonationMethod[] = [
    {
      label: 'СБП (Т-банк)',
      value: '+79939009598',
    },
    {
      label: 'Карта TBC (Только GEL)',
      value: 'GE15TB7537945061200012',
    },
    {
      label: 'TON',
      value: 'UQBagnAhrTd6AJbQg8zfP9oyIFU_8a5RgX_78k64jBVxLLEJ',
    },
    {
      label: 'USDT (TRC20)',
      value: 'TSG71BQmZL2E6q46u39PfUQSjaWNcENmRm',
    },
  ];

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="donate-dialog-overlay" onClick={onClose}>
      <div className="donate-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="donate-dialog-header">
          <h3>Поддержать проект</h3>
          <button className="donate-dialog-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="donate-dialog-content">
          <p className="donate-dialog-description">
            Проект развивается на донатной основе. Спасибо за вашу поддержку! 💙
          </p>

          <div className="donate-methods">
            {donationMethods.map((method, index) => (
              <div key={index} className="donate-method">
                <label className="donate-method-label">{method.label}</label>
                <div className="donate-method-value-container">
                  <div className="donate-method-value" title={method.value}>
                    {method.value}
                  </div>
                  <button
                    className={`donate-copy-button ${copiedIndex === index ? 'copied' : ''}`}
                    onClick={() => handleCopy(method.value, index)}
                  >
                    {copiedIndex === index ? '✓' : '📋'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonateDialog;
