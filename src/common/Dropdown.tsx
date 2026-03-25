import React from 'react'

interface DropdownProps {
  placeholder: string
  value: any
   onChange: (value: string) => void;
}

function Dropdown({placeholder, value, onChange}: DropdownProps) {
  return (
    <input 
    placeholder={placeholder} 
    className='w-full py-2 px-4 border border-gray-200 rounded-md focus:border focus:border-primary-400 focus:ring-2 focus:ring-primary-50 outline-none' 
    value={value} 
    onChange={(e)=>onChange(e.target.value)}/>
    
  )
}

export default Dropdown