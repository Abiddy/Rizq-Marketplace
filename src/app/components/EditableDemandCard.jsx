export default function EditableDemandCard({ demand, onEdit, onDelete }) {
  return (
    <div className="bg-[#222222] rounded-lg p-4 border-l-4 border-yellow-500">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-base text-white">{demand.title}</h3>
          <p className="text-green-400 text-sm mt-1">{demand.budget || "300"}</p>
          <p className="text-gray-400 text-sm mt-1">{demand.location || "sa,mds,"}</p>
        </div>
        <div className="text-right">
          <p className="text-green-400 text-xs font-medium">{demand.match_percentage || "0"}% Match</p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onEdit(demand)}
          className="border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded hover:bg-gray-800"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(demand.id)}
          className="border border-gray-700 text-gray-300 text-xs px-3 py-1 rounded hover:bg-gray-800"
        >
          Delete
        </button>
      </div>
    </div>
  );
} 