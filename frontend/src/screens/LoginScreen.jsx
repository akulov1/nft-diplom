import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native-web'

export default function LoginScreen({ onLogin }) {
  const [address, setAddress] = useState('')
  const [connectHover, setConnectHover] = useState(false)

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
        alert('Подключение к MetaMask отклонено')
      }
    } else {
      alert('Установите MetaMask')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.bgGlow} />
      <View style={styles.card}>
        <Text style={styles.logoIcon}>◆</Text>
        <Text style={styles.title}>NFT Marketplace</Text>
        <Text style={styles.subtitle}>Подключите кошелёк для входа</Text>

        <TouchableOpacity
          style={[styles.metamaskBtn, connectHover && styles.metamaskBtnHover]}
          onPress={handleMetaMask}
          onMouseEnter={() => setConnectHover(true)}
          onMouseLeave={() => setConnectHover(false)}
        >
          <Text style={styles.metamaskIcon}>🦊</Text>
          <Text style={styles.metamaskBtnText}>Подключить MetaMask</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>или</Text>
          <View style={styles.line} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="0x... введите адрес кошелька"
          placeholderTextColor="#475569"
          value={address}
          onChangeText={setAddress}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.connectBtn, !address && styles.disabled, address && styles.connectBtnActive]}
          onPress={handleConnect}
          disabled={!address}
        >
          <Text style={styles.connectBtnText}>Войти</Text>
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
    backgroundColor: '#060b18',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(59,130,246,0.06)',
    top: '50%',
    left: '50%',
    marginTop: -300,
    marginLeft: -300,
    filter: 'blur(60px)',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 36,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#1e293b',
    animation: 'fadeInUp 0.5s ease-out',
    position: 'relative',
    zIndex: 1,
  },
  logoIcon: {
    fontSize: 40,
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  metamaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1e293b',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
    transition: 'all 0.2s ease',
  },
  metamaskBtnHover: {
    borderColor: '#f6851b',
    backgroundColor: 'rgba(246,133,27,0.1)',
  },
  metamaskIcon: {
    fontSize: 20,
  },
  metamaskBtnText: {
    color: '#f1f5f9',
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
    backgroundColor: '#1e293b',
  },
  or: {
    marginHorizontal: 12,
    color: '#64748b',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 12,
    outlineStyle: 'none',
    backgroundColor: '#060b18',
    color: '#f1f5f9',
    transition: 'border-color 0.2s ease',
  },
  connectBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  connectBtnActive: {
    backgroundColor: '#3b82f6',
  },
  disabled: {
    backgroundColor: '#1e293b',
    opacity: 0.5,
  },
  connectBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
