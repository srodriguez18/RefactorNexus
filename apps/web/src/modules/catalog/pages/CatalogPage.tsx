import { useState, useEffect } from 'react'
import type { CreateProductDto } from '@legacy-nexus/shared'
import { useListProducts, useSearchProducts, useCreateProduct, useDeleteProduct } from '../hooks/useProducts'
import { ProductList } from '../components/ProductList'
import { ProductForm } from '../components/ProductForm'
import { useCurrentUser } from '../../auth/hooks/useAuth'

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
}

const modalStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '8px',
  padding: '1.75rem',
  width: '480px',
  maxWidth: '92vw',
  maxHeight: '90vh',
  overflowY: 'auto',
}

export function CatalogPage() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const user = useCurrentUser()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const listQuery = useListProducts()
  const searchQuery = useSearchProducts(debouncedTerm)
  const createProduct = useCreateProduct()
  const deleteProduct = useDeleteProduct()

  const isSearching = debouncedTerm.length > 0
  const activeQuery = isSearching ? searchQuery : listQuery

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) {
      deleteProduct.mutate(id)
    }
  }

  const handleCreate = (data: CreateProductDto) => {
    createProduct.mutate(data, {
      onSuccess: () => setShowModal(false),
    })
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Catálogo</h1>
        {user?.isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '0.5rem 1rem',
              background: '#1a1a2e',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            + Nuevo Producto
          </button>
        )}
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Buscar por nombre…"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        aria-label="Buscar productos"
        style={{
          padding: '0.45rem 0.75rem',
          marginBottom: '1.25rem',
          width: '280px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '0.9rem',
        }}
      />

      <ProductList
        products={activeQuery.data ?? []}
        isLoading={activeQuery.isLoading}
        isError={activeQuery.isError}
        onRetry={() => activeQuery.refetch()}
        onDelete={handleDelete}
      />

      {/* Modal nuevo producto */}
      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Nuevo Producto</h2>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Cerrar"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
            {createProduct.isError && (
              <p style={{ color: '#c00', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                {createProduct.error instanceof Error
                  ? createProduct.error.message
                  : 'Error al crear el producto'}
              </p>
            )}
            <ProductForm onSubmit={handleCreate} isLoading={createProduct.isPending} />
          </div>
        </div>
      )}
    </div>
  )
}
