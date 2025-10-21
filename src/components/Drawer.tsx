import React, { useEffect, useState } from 'react';
import '../styles/drawer.css';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({ 
  isOpen, 
  onClose, 
  side = 'right',
  children 
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsMounted(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isMounted) return null;

  return (
    <div 
      className={`drawer-overlay ${isAnimating ? 'drawer-overlay-open' : ''}`} 
      onClick={onClose}
    >
      <div 
        className={`drawer drawer-${side} ${isAnimating ? 'drawer-open' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
};

export default Drawer;
