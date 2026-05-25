import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { View, StyleSheet } from 'react-native-web'
import Header from './components/Header'
import LoginScreen from './screens/LoginScreen'
import HomeScreen from './screens/HomeScreen'
import CreateNFTScreen from './screens/CreateNFTScreen'
import CollectionScreen from './screens/CollectionScreen'
import NFTScreen from './screens/NFTScreen'

export default function App() {
  const [wallet, setWallet] = useState(() => localStorage.getItem('wallet'))
  const navigate = useNavigate()

  function handleLogin(address) {
    setWallet(address)
    localStorage.setItem('wallet', address)
    navigate('/')
  }

  function handleLogout() {
    setWallet(null)
    localStorage.removeItem('wallet')
    navigate('/login')
  }

  if (!wallet) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <View style={styles.app}>
      <Header wallet={wallet} onLogout={handleLogout} />
      <View style={styles.content}>
        <Routes>
          <Route path="/" element={<HomeScreen navigate={navigate} />} />
          <Route path="/create" element={<CreateNFTScreen wallet={wallet} />} />
          <Route path="/collection" element={<CollectionScreen wallet={wallet} navigate={navigate} />} />
          <Route path="/nft/:id" element={<NFTScreen wallet={wallet} />} />
        </Routes>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  app: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
})
