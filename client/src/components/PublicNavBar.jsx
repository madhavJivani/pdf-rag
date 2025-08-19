import React from 'react'

const PublicNavBar = () => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">PDF RAG</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 text-sm">Welcome to PDF RAG</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default PublicNavBar
