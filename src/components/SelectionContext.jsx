// src/components/SelectionContext.jsx
import { createContext, useContext, useState } from 'react'

const SelectionContext = createContext()

export function SelectionProvider({ children }) {
  const [selectedId, setSelectedId] = useState(null)

  const select = (id) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  const deselect = () => {
    setSelectedId(null)
  }

  const isSelected = (id) => {
    return selectedId === id
  }

  // Log state changes
  return (
    <SelectionContext.Provider value={{ selectedId, select, deselect, isSelected }}>
      {children}
    </SelectionContext.Provider>
  )
}

export function useSelection() {
  const context = useContext(SelectionContext)
  if (!context) {
    throw new Error('❌ useSelection must be used within SelectionProvider')
  }
  return context
}

