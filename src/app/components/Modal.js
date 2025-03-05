'use client';

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {children}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}