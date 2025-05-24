'use client'

interface Product {
  name: string
  price: string
  image: string
}

export default function ProductList() {
  const products: Product[] = [
    {
      name: 'Gadget Converter',
      price: '$250',
      image: '🔌'
    },
    {
      name: 'Lens Camera',
      price: '$50',
      image: '📸'
    },
    {
      name: 'Airpods',
      price: '$100',
      image: '🎧'
    },
    {
      name: 'Macbook',
      price: '$999',
      image: '💻'
    }
  ]

  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Popular Product</h2>
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-xl">
              {product.image}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
