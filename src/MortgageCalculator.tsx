import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Card,
  Form,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Toast,
} from '@douyinfe/semi-ui'
import { IconCopy } from '@douyinfe/semi-icons'

const { Title, Paragraph, Text } = Typography

interface MortgagePlan {
  totalPrice: number
  downPayment: number
  interestRate: number
  loanTerm: number
  monthlyPayment: number
  loanAmount: number
  timestamp?: number
}

interface FormValues {
  totalPrice: number
  downPayment: number
  interestRate: number
  loanTerm: number
}

// 增强版格式化货币函数
const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0'
  }
  return value.toLocaleString('zh-CN')
}

// Add this function to format the mortgage details for copying
const formatDetailsForCopy = (plan: MortgagePlan): string => {
  // Format the down payment in 10,000 units (万)
  const downPaymentInWan = plan.downPayment / 10000

  return `- 总价 ${plan.totalPrice}
- 用 ${downPaymentInWan}w 首付, 剩下 ${plan.loanAmount} 还贷款
- 当前商业贷款 ${plan.interestRate}% ， 分 ${plan.loanTerm / 12} 年， 每月 ${
    plan.monthlyPayment
  }`
}

// Add this function for clipboard operations
const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      Toast.success('复制成功')
    })
    .catch(err => {
      console.error('Failed to copy:', err)
      Toast.error('复制失败')
    })
}

// Update this function to generate random people emojis
const getRandomEmoji = () => {
  // A collection of people/facial expression emojis
  const emojis = [
    '😀',
    '😁',
    '😊',
    '🙂',
    '😎',
    '🤩',
    '🥳',
    '🤔',
    '🤗',
  ]
  return emojis[Math.floor(Math.random() * emojis.length)]
}

const MortgageCalculator: React.FC = () => {
  const formRef = useRef<Form>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [currentPlan, setCurrentPlan] = useState<MortgagePlan | null>(null)
  const [history, setHistory] = useState<MortgagePlan[]>([])
  const [formValues, setFormValues] = useState<FormValues>({
    totalPrice: Number(import.meta.env.VITE_DEFAULT_TOTAL_PRICE || 1410528.0),
    downPayment: Number(import.meta.env.VITE_DEFAULT_DOWN_PAYMENT || 600000),
    interestRate: Number(import.meta.env.VITE_DEFAULT_INTEREST_RATE || 3.15),
    loanTerm: Number(import.meta.env.VITE_DEFAULT_LOAN_TERM || 360),
  })

  // Add this state to store emoji for each history item
  const [emojiMap, setEmojiMap] = useState<{ [key: number]: string }>({})

  // 计算月付款额 - 增加异常处理
  const calculateMonthlyPayment = (
    loanAmount: number,
    rate: number,
    months: number,
  ): number => {
    // 基本验证
    if (loanAmount <= 0 || months <= 0) return 0

    // 处理无息贷款情况
    if (rate === 0) return parseFloat((loanAmount / months).toFixed(2))

    const monthlyRate = rate / 100 / 12
    const denominator = 1 - Math.pow(1 + monthlyRate, -months)

    // 防止除以零错误
    if (Math.abs(denominator) < 0.0000001) return 0

    const payment = (loanAmount * monthlyRate) / denominator

    // 确保结果是有效数字
    return isNaN(payment) ? 0 : parseFloat(payment.toFixed(2))
  }

  // Update current plan without saving to history
  const updateCurrentPlan = (values: FormValues) => {
    const { totalPrice, downPayment, interestRate, loanTerm } = values

    const plan: MortgagePlan = {
      totalPrice: totalPrice || 0,
      downPayment: downPayment || 0,
      interestRate: interestRate || 0,
      loanTerm: loanTerm || 1,
      loanAmount: (totalPrice || 0) - (downPayment || 0),
      monthlyPayment: 0,
      timestamp: Date.now(),
    }

    const calculatedPayment = calculateMonthlyPayment(
      plan.loanAmount,
      plan.interestRate,
      plan.loanTerm,
    )
    plan.monthlyPayment = isNaN(calculatedPayment) ? 0 : calculatedPayment

    setCurrentPlan(plan)
  }

  // 生成贷款方案 - 仅在点击按钮时添加到历史记录
  const generatePlan = (values: FormValues) => {
    setLoading(true)

    // Update current plan
    updateCurrentPlan(values)

    // Add to history only when button is clicked
    if (currentPlan) {
      const lastItem = history[0]
      if (
        !lastItem ||
        lastItem.totalPrice !== currentPlan.totalPrice ||
        lastItem.downPayment !== currentPlan.downPayment ||
        lastItem.interestRate !== currentPlan.interestRate ||
        lastItem.loanTerm !== currentPlan.loanTerm
      ) {
        // Create new history with current plan at the beginning
        const newHistory = [currentPlan, ...history].slice(0, 10)
        setHistory(newHistory)

        // Assign emoji to the new item
        setEmojiMap(prev => ({
          ...prev,
          [currentPlan.timestamp || Date.now()]: getRandomEmoji(),
        }))
      }
    }

    setLoading(false)
  }

  // 处理表单值变化
  const handleFormChange = (formState: { values: FormValues }) => {
    const values: FormValues = formState.values
    setFormValues(values)

    // Update current plan but don't add to history
    updateCurrentPlan(values)
  }

  // 初始加载时计算
  useEffect(() => {
    updateCurrentPlan(formValues) // Only update UI, don't add to history
  }, [])

  // 格式化年数显示
  const formatYears = (months: number): string => {
    return `${months / 12} 年`
  }

  // 从历史记录恢复
  const restoreFromHistory = (historyItem: MortgagePlan) => {
    if (formRef.current) {
      const values = {
        totalPrice: historyItem.totalPrice,
        downPayment: historyItem.downPayment,
        interestRate: historyItem.interestRate,
        loanTerm: historyItem.loanTerm,
      }
      formRef.current.formApi.setValue('totalPrice', values.totalPrice)
      formRef.current.formApi.setValue('downPayment', values.downPayment)
      formRef.current.formApi.setValue('interestRate', values.interestRate)
      formRef.current.formApi.setValue('loanTerm', values.loanTerm)
      setFormValues(values)
      generatePlan(values)
    }
  }

  return (
    <Card
      className='mortgage-calculator'
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
      shadows='hover'>
      <Card.Meta
        title={
          <Title heading={3} style={{ margin: '0 0 8px 0' }}>
            房贷方案计算器
          </Title>
        }
        description={
          <Paragraph type='tertiary'>输入房屋信息计算月供金额</Paragraph>
        }
      />

      <Row
        gutter={[24, 16]}
        style={{ marginTop: '24px' }}
        type="flex"
        align="stretch">
        {/* 第一列：输入表单 */}
        <Col
          xs={24}
          md={8}
          style={{ display: 'flex' }}>
          <Card
            title='输入参数'
            style={{
              width: '100%',
              backgroundColor: 'var(--semi-color-bg-0)',
              border: '1px solid var(--semi-color-border)',
            }}>
            <Form
              ref={formRef}
              labelPosition='top'
              style={{ width: '100%' }}
              initValues={formValues}
              onChange={formState =>
                handleFormChange(formState as unknown as { values: FormValues })
              }>
              <Form.InputNumber
                label='房屋总价'
                field='totalPrice'
                prefix='¥'
                style={{ width: '100%' }}
              />

              <Form.InputNumber
                label='首付金额'
                field='downPayment'
                prefix='¥'
                style={{ width: '100%' }}
              />

              <Form.InputNumber
                label='商业贷款利率 (%)'
                field='interestRate'
                step={0.01}
                precision={2}
                style={{ width: '100%' }}
              />

              <Form.InputNumber
                label='分期时间 (月)'
                field='loanTerm'
                step={12}
                precision={0}
                style={{ width: '100%' }}
              />

              <Button
                theme='solid'
                type='primary'
                size='large'
                block
                onClick={() => generatePlan(formValues)}
                loading={loading}
                style={{ marginTop: '16px' }}>
                计算月供
              </Button>
            </Form>
          </Card>
        </Col>

        {/* 第二列：输出结果 */}
        <Col
          xs={24}
          md={8}
          style={{ display: 'flex' }}>
          <Card
            title='贷款方案'
            style={{
              width: '100%',
              backgroundColor: 'var(--semi-color-bg-0)',
              border: '1px solid var(--semi-color-border)',
            }}>
            {currentPlan ? (
              <Space vertical align='start' style={{ width: '100%' }}>
                <Card
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--semi-color-primary-light-default)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}
                  bodyStyle={{ padding: '16px' }}>
                  <Text type='secondary'>每月还款</Text>
                  <Title
                    heading={3}
                    style={{
                      margin: '8px 0 0',
                      color: 'var(--semi-color-primary)',
                      fontSize: '28px',
                    }}>
                    ¥ {formatCurrency(currentPlan.monthlyPayment)}
                  </Title>
                </Card>

                <div style={{ width: '100%', textAlign: 'left' }}>
                  <Space vertical align='start' style={{ width: '100%' }}>
                    <Text>
                      • 总价：¥ {formatCurrency(currentPlan.totalPrice)}
                    </Text>
                    <Text>
                      • 首付：¥ {formatCurrency(currentPlan.downPayment)}
                    </Text>
                    <Text>
                      • 贷款金额：¥ {formatCurrency(currentPlan.loanAmount)}
                    </Text>
                    <Text>
                      • 商业贷款 {currentPlan.interestRate}%，分期{' '}
                      {formatYears(currentPlan.loanTerm)}
                    </Text>
                  </Space>
                </div>
              </Space>
            ) : (
              <Text type='tertiary'>请填写表单计算贷款方案</Text>
            )}
          </Card>
        </Col>

        {/* 第三列：历史记录 */}
        <Col
          xs={24}
          md={8}
          style={{ display: 'flex' }}>
          <Card
            title='历史方案'
            style={{
              width: '100%',
              backgroundColor: 'var(--semi-color-bg-0)',
              border: '1px solid var(--semi-color-border)',
            }}
            bodyStyle={{
              padding: '8px',
              overflowY: 'auto',
              height: 'calc(100% - 56px)', // Subtract header height
            }}>
            {history.length > 0 ? (
              <Space vertical spacing='tight' style={{ width: '100%' }}>
                {history.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      cursor: 'pointer',
                      padding: '0',
                      borderRadius: '4px',
                      backgroundColor: 'var(--semi-color-bg-1)',
                      marginBottom: '8px',
                      transition: 'all 0.2s',
                      display: 'flex',
                      height: '70px', // Fixed height for consistent appearance
                    }}
                    className='history-item'
                    onClick={() => restoreFromHistory(item)}>
                    {/* Column 1: Emoji - full height */}
                    <div
                      style={{
                        fontSize: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '60px',
                        borderRight: '1px solid var(--semi-color-border)',
                        height: '100%',
                        backgroundColor: 'var(--semi-color-bg-2)',
                      }}>
                      {emojiMap[item.timestamp || 0] || getRandomEmoji()}
                    </div>

                    {/* Column 2: Plan details */}
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px',
                      }}>
                      <Space vertical align='start' style={{ width: '100%' }}>
                        <Text strong>
                          ¥ {formatCurrency(item.monthlyPayment)} / 月
                        </Text>
                        <Text type='tertiary' size='small'>
                          总价: ¥{formatCurrency(item.totalPrice)} | 首付: ¥
                          {formatCurrency(item.downPayment)} |{' '}
                          {formatYears(item.loanTerm)}
                        </Text>
                      </Space>
                    </div>

                    {/* Column 3: Copy button - full height */}
                    <div
                      style={{
                        width: '50px',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderLeft: '1px solid var(--semi-color-border)',
                      }}
                      onClick={e => {
                        e.stopPropagation()
                        copyToClipboard(formatDetailsForCopy(item))
                      }}>
                      <IconCopy
                        size='large'
                        style={{ color: 'var(--semi-color-text-2)' }}
                      />
                    </div>
                  </div>
                ))}
              </Space>
            ) : (
              <Text
                type='tertiary'
                style={{ padding: '16px', display: 'block' }}>
                尚无历史方案记录
              </Text>
            )}
          </Card>
        </Col>
      </Row>
    </Card>
  )
}

export default MortgageCalculator
