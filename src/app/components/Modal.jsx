import { motion } from 'framer-motion';

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1E1E1E] rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-1 md:p-2">
          {children}
        </div>
      </motion.div>
    </div>
  );
} 