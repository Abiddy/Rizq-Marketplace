export default function EditableGigCard({ gig, onEdit, onDelete }) {
  return (
    <div className="bg-[#222222] rounded-lg p-4 border-l-4 border-orange-500">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-base text-white">{gig.title}</h3>
          <p className="text-indigo-400 text-sm mt-1">{gig.category || "Logo Design"}</p>
          <p className="text-gray-400 text-sm mt-1">{gig.description}</p>
          <p className="text-white text-sm font-medium mt-2">${gig.budget || "250.00"}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onEdit(gig)}
          className="border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded hover:bg-gray-800"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(gig.id)}
          className="border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded hover:bg-gray-800"
        >
          Delete
        </button>
      </div>
    </div>
  );
} 