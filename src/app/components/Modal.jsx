import { motion } from 'framer-motion';

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-black rounded-lg shadow-xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-xl overflow-auto"
      >
        <div className="p-0 sm:p-0">
          {children}
        </div>
      </motion.div>
    </div>
  );
} 