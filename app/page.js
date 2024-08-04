'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box, Stack, Typography, Button, Modal, TextField, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, createTheme, ThemeProvider, TableSortLabel
} from '@mui/material'
import { firestore } from '@/firebase'
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';

// Dark mode theme
const theme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiModal: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(4px)',
        },
      },
    },
  },
});

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#333', // Dark background for modal
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [editName, setEditName] = useState('')
  const [editQuantity, setEditQuantity] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('name')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRow, setExpandedRow] = useState(null) // Track expanded row

  const updateInventory = useCallback(async () => {
    setLoading(true)
    try {
      const snapshot = query(collection(firestore, 'inventory'))
      const docs = await getDocs(snapshot)
      const inventoryList = []
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() })
      })
      setInventory(inventoryList)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const addItem = async (item, quantity, description) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity: existingQuantity, description: existingDescription } = docSnap.data()
        await setDoc(docRef, { quantity: existingQuantity + parseInt(quantity, 10), description: existingDescription })
      } else {
        await setDoc(docRef, { quantity: parseInt(quantity, 10), description })
      }
      await updateInventory()
    } catch (err) {
      setError(err.message)
    }
  }

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      await deleteDoc(docRef)
      await updateInventory()
    } catch (err) {
      setError(err.message)
    }
  }

  const editItem = async (item, quantity, description) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      await setDoc(docRef, { quantity: parseInt(quantity, 10), description })
      await updateInventory()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleOpenAdd = () => setOpenAdd(true)
  const handleCloseAdd = () => setOpenAdd(false)
  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setEditName(item.name)
    setEditQuantity(item.quantity)
    setEditDescription(item.description || '')
    setOpenEdit(true)
  }
  const handleCloseEdit = () => setOpenEdit(false)

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (orderBy === 'name') {
      return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    } else if (orderBy === 'quantity') {
      return order === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity
    }
    return 0
  })

  useEffect(() => {
    updateInventory()
  }, [updateInventory])

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        gap={2}
        sx={{ bgcolor: theme.palette.background.default, color: theme.palette.text.primary }}
      >
        {/* Header */}
        <Box
          width="100%"
          bgcolor="#444"
          display="flex"
          justifyContent="center"
          alignItems="center"
          py={2}
          mb={2}
        >
          <Typography variant="h4">Pantry Tracker</Typography>
        </Box>

        {/* Search Bar */}
        <Box width="800px" mb={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              id="search-bar"
              label="Search"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon />
              }}
            />
            <Button variant="outlined" onClick={handleOpenAdd}>
              Add New Item
            </Button>
          </Stack>
        </Box>

        {/* Add Item Modal */}
        <Modal
          open={openAdd}
          onClose={handleCloseAdd}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack spacing={2}>
              <TextField
                id="item-name"
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                id="item-quantity"
                label="Quantity"
                variant="outlined"
                fullWidth
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
              />
              <TextField
                id="item-description"
                label="Description"
                variant="outlined"
                fullWidth
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName, itemQuantity, itemDescription)
                  setItemName('')
                  setItemQuantity('')
                  setItemDescription('')
                  handleCloseAdd()
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* Edit Item Modal */}
        <Modal
          open={openEdit}
          onClose={handleCloseEdit}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Edit Item
            </Typography>
            <Stack spacing={2}>
              <TextField
                id="edit-item-name"
                label="Item Name"
                variant="outlined"
                fullWidth
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <TextField
                id="edit-item-quantity"
                label="Quantity"
                variant="outlined"
                fullWidth
                type="number"
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
              />
              <TextField
                id="edit-item-description"
                label="Description"
                variant="outlined"
                fullWidth
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  editItem(editingItem.name, editQuantity, editDescription)
                  setEditName('')
                  setEditQuantity('')
                  setEditDescription('')
                  handleCloseEdit()
                }}
              >
                Save
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* Inventory Table */}
{loading ? (
  <CircularProgress />
) : error ? (
  <Typography color="error">{error}</Typography>
) : (
  <TableContainer
    component={Paper}
    sx={{
      maxWidth: '800px', // Set maximum width for the table container
      borderRadius: '8px', // Rounded corners
      overflow: 'hidden', // Ensure rounded corners apply to table content
    }}
  >
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>
            <TableSortLabel
              active={orderBy === 'name'}
              direction={orderBy === 'name' ? order : 'asc'}
              onClick={() => handleRequestSort('name')}
            >
              Item Name
            </TableSortLabel>
          </TableCell>
          <TableCell>
            <TableSortLabel
              active={orderBy === 'quantity'}
              direction={orderBy === 'quantity' ? order : 'asc'}
              onClick={() => handleRequestSort('quantity')}
            >
              Quantity
            </TableSortLabel>
          </TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedInventory.map((item, index) => (
          <TableRow
            key={item.name}
            onClick={() => setExpandedRow(expandedRow === index ? null : index)}
          >
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell
              sx={{
                maxWidth: '200px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: 'pointer'
              }}
              onClick={() => setExpandedRow(expandedRow === index ? null : index)}
            >
              {expandedRow === index 
                ? item.description
                : item.description && item.description.length > 50
                  ? item.description.slice(0, 50) + '...' 
                  : item.description
              }
            </TableCell>
            <TableCell>
              <IconButton onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={(e) => { e.stopPropagation(); removeItem(item.name); }}>
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)}

      </Box>
    </ThemeProvider>
  )
}
