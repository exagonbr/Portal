'use client'

interface Document {
  name: string
  file: string
  category: string
  author: string
  status: 'Send' | 'Pending'
}

export default function ActivityTable() {
  const documents: Document[] = [
    {
      name: 'Annual Report',
      file: 'PDF',
      category: 'Property',
      author: 'Diana Matthews',
      status: 'Send'
    },
    {
      name: 'Business Plan',
      file: 'WORD',
      category: 'Cryptocurrency',
      author: 'Philip James',
      status: 'Send'
    },
    {
      name: 'Marketing Tool',
      file: 'PDF',
      category: 'Content Creator',
      author: 'Amanda Ross',
      status: 'Pending'
    }
  ]

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-gray-200">
        <h2 className="text-lg font-semibold">Document</h2>
        <select className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-4">Name</th>
                <th className="pb-4">File</th>
                <th className="pb-4">Category</th>
                <th className="pb-4">Author</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="py-4">{doc.name}</td>
                  <td className="py-4">{doc.file}</td>
                  <td className="py-4">{doc.category}</td>
                  <td className="py-4">{doc.author}</td>
                  <td className="py-4">
                    <span 
                      className={`px-3 py-1 rounded-full text-sm ${
                        doc.status === 'Send' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
