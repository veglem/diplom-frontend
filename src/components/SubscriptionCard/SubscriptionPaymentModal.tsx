import React, { useState } from 'react';
import {
  Box,
  Button,
  Modal,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import { useWriter, SubscriptionLevel } from '../../contexts/WriterContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface SubscriptionPaymentModalProps {
  open: boolean;
  onClose: () => void;
  subscriptionLevel: SubscriptionLevel;
}

const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({
  open,
  onClose,
  subscriptionLevel
}) => {
  const { subscribeToLevel } = useWriter();
  const { lang } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [months, setMonths] = useState(1);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = parseFloat(subscriptionLevel.price) * months;

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setMonths(1);
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      await subscribeToLevel(subscriptionLevel.id, months);
      handleNext(); // Переход к шагу успешной оплаты
    } catch (error) {
      console.error('Ошибка при оформлении подписки:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // Удаляем все нецифровые символы
    const cleaned = value.replace(/\D/g, '');
    // Ограничиваем длину до 16 символов
    const limited = cleaned.substring(0, 16);
    // Форматируем в группы по 4 цифры
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiryDate = (value: string) => {
    // Удаляем все нецифровые символы
    const cleaned = value.replace(/\D/g, '');
    // Ограничиваем длину до 4 символов
    const limited = cleaned.substring(0, 4);
    // Форматируем как MM/YY
    if (limited.length > 2) {
      return `${limited.substring(0, 2)}/${limited.substring(2)}`;
    }
    return limited;
  };

  const isStepOneValid = months > 0;
  const isStepTwoValid = 
    cardNumber.replace(/\s/g, '').length === 16 && 
    cardName.trim().length > 0 && 
    expiryDate.length === 5 && 
    cvv.length === 3;

  const steps = [
    lang.CHOOSE_SUBSCRIPTION_PERIOD,
    lang.PAYMENT,
    lang.CONFIRMATION
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="subscription-payment-modal-title"
    >
      <Paper sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        maxWidth: '90%',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
      }}>
        <Typography id="subscription-payment-modal-title" variant="h6" component="h2" gutterBottom>
          {lang.SUBSCRIPTION_CHECKOUT}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {subscriptionLevel.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {subscriptionLevel.description}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {lang.PRICE_PER_MONTH} {subscriptionLevel.price} {lang.CURRENCY} / {lang.MONTH_SINGLE}
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel id="months-select-label">{lang.SUBSCRIPTION_PERIOD}</InputLabel>
              <Select
                labelId="months-select-label"
                id="months-select"
                value={months}
                label={lang.SUBSCRIPTION_PERIOD}
                onChange={(e) => setMonths(Number(e.target.value))}
              >
                <MenuItem value={1}>{lang.ONE_MONTH}</MenuItem>
                <MenuItem value={3}>{lang.THREE_MONTHS}</MenuItem>
                <MenuItem value={6}>{lang.SIX_MONTHS}</MenuItem>
                <MenuItem value={12}>{lang.TWELVE_MONTHS}</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="h6" sx={{ mt: 2 }}>
              {lang.TOTAL} {totalPrice} {lang.CURRENCY}
            </Typography>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleClose}>
                {lang.CANCEL}
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepOneValid}
              >
                {lang.NEXT}
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {lang.CARD_DETAILS}
            </Typography>

            <TextField
              margin="normal"
              required
              fullWidth
              id="card-number"
              label={lang.CARD_NUMBER}
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="card-name"
              label={lang.CARDHOLDER_NAME}
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              placeholder="IVAN IVANOV"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                margin="normal"
                required
                id="expiry-date"
                label={lang.EXPIRY_DATE}
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                placeholder="MM/YY"
                sx={{ width: '50%' }}
              />

              <TextField
                margin="normal"
                required
                id="cvv"
                label="CVV"
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                placeholder="123"
                sx={{ width: '50%' }}
              />
            </Box>

            <Typography variant="h6" sx={{ mt: 2 }}>
              {lang.TOTAL_TO_PAY} {totalPrice} {lang.CURRENCY}
            </Typography>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>
                {lang.BACK}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!isStepTwoValid || isProcessing}
              >
                {isProcessing ? <CircularProgress size={24} /> : lang.PAY}
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {lang.SUBSCRIPTION_SUCCESS}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {lang.SUBSCRIPTION_SUCCESS_MESSAGE} "{subscriptionLevel.title}" {lang.FOR} {months} {
                months === 1 ? lang.MONTH_SINGLE : months < 5 ? lang.MONTH_FEW : lang.MONTH_MANY
              }.
            </Typography>
            <Typography variant="body1" gutterBottom>
              {lang.AMOUNT_CHARGED} {totalPrice} {lang.CURRENCY}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleClose}
              sx={{ mt: 3 }}
            >
              {lang.CLOSE}
            </Button>
          </Box>
        )}
      </Paper>
    </Modal>
  );
};

export default SubscriptionPaymentModal;
