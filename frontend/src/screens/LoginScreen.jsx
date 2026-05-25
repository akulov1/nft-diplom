import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native-web'

export default function LoginScreen({ onLogin }) {
  const [address, setAddress] = useState('')

  function handleConnect() {
    const trimmed = address.trim()
    if (trimmed && trimmed.startsWith('0x') && trimmed.length === 42) {
      onLogin(trimmed)
    }
  }

  async function handleMetaMask() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts[0]) onLogin(accounts[0])
      } catch (e) {
        alert('MetaMask connection rejected')
      }
    } else {
      alert('Please install MetaMask')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>NFT Marketplace</Text>
        <Text style={styles.subtitle}>Connect your wallet to start</Text>

        <TouchableOpacity style={styles.metamaskBtn} onPress={handleMetaMask}>
          <Text style={styles.metamaskBtnText}>Connect MetaMask</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="0x... paste wallet address"
          value={address}
          onChangeText={setAddress}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.connectBtn, !address && styles.disabled]}
          onPress={handleConnect}
          disabled={!address}
        >
          <Text style={styles.connectBtnText}>Connect</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6c5ce7',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
  metamaskBtn: {
    backgroundColor: '#f6851b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  metamaskBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  or: {
    marginHorizontal: 12,
    color: '#999',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 12,
    outlineStyle: 'none',
  },
  connectBtn: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  connectBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
