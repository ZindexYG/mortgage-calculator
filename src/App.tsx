import React from 'react'
import { Layout, ConfigProvider } from '@douyinfe/semi-ui'
import MortgageCalculator from './MortgageCalculator'
import '@douyinfe/semi-ui/dist/css/semi.min.css'

const { Content } = Layout

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <Layout
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--semi-color-bg-0)',
        }}>
        <Content
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            minHeight: '100vh',
          }}>
          <MortgageCalculator />
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

export default App
