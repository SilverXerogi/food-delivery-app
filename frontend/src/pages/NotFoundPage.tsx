import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h1 style={{ fontSize: '64px', marginBottom: '20px' }}>404</h1>
      <p style={{ fontSize: '24px', marginBottom: '30px' }}>Страница не найдена</p>
      <Link 
        to="/" 
        style={{ 
          padding: '12px 24px', 
          backgroundColor: '#1890ff', 
          color: 'white', 
          borderRadius: '6px', 
          textDecoration: 'none' 
        }}
      >
        Вернуться на главную
      </Link>
    </div>
  )
}

export default NotFoundPage 