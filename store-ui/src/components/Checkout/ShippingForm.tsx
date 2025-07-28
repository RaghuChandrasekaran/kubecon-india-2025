import React, { useState } from 'react';
import {
    Box,
    Grid,
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Typography,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Select,
    MenuItem,
    Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getShippingCost, formatCurrency } from '../../api/cart';
import { Address } from '../../api/users';

interface ShippingFormProps {
    formData: any;
    errors: Record<string, string>;
    addresses: Address[];
    selectedAddress: Address | null;
    expandedSection: string;
    isCompleted: boolean;
    onFormChange: (section: string, field: string, value: string) => void;
    onAddressSelect: (address: Address | null) => void;
    onShippingMethodChange: (method: string) => void;
    onSectionChange: (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
    onNextStep: () => void;
}

const ShippingForm = ({
    formData,
    errors,
    addresses,
    selectedAddress,
    expandedSection,
    isCompleted,
    onFormChange,
    onAddressSelect,
    onShippingMethodChange,
    onSectionChange,
    onNextStep
}: ShippingFormProps) => {
    const [useNewAddress, setUseNewAddress] = useState(addresses.length === 0);

    const validateShippingForm = (): boolean => {
        if (!useNewAddress && selectedAddress) return true;
        
        const requiredFields = ['firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'];
        return requiredFields.every(field => formData.shipping[field]?.trim());
    };

    const handleNextStep = () => {
        if (validateShippingForm()) {
            onNextStep();
        }
    };

    const shippingMethods = [
        { id: 'default', name: 'Free Shipping', time: '5-7 business days', cost: 0 },
        { id: 'standard', name: 'Standard Shipping', time: '3-5 business days', cost: 99 },
        { id: 'express', name: 'Express Shipping', time: '1-2 business days', cost: 199 },
        { id: 'overnight', name: 'Overnight Shipping', time: 'Next business day', cost: 399 }
    ];

    return (
        <Accordion 
            expanded={expandedSection === 'shipping'} 
            onChange={onSectionChange('shipping')}
            sx={{ mb: 2, borderRadius: '8px', boxShadow: 2 }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {isCompleted ? (
                        <CheckCircleIcon color="success" />
                    ) : (
                        <LocalShippingIcon color="primary" />
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        1. Shipping Address
                    </Typography>
                    {isCompleted && (
                        <Typography variant="body2" color="success.main" sx={{ ml: 'auto' }}>
                            Completed
                        </Typography>
                    )}
                </Box>
            </AccordionSummary>
            
            <AccordionDetails>
                <Box sx={{ width: '100%' }}>
                    {/* Saved Addresses Selection */}
                    {addresses.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                Select a saved address:
                            </Typography>
                            <FormControl component="fieldset">
                                <RadioGroup
                                    value={useNewAddress ? 'new' : selectedAddress?.id || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === 'new') {
                                            setUseNewAddress(true);
                                            onAddressSelect(null);
                                        } else {
                                            setUseNewAddress(false);
                                            const address = addresses.find(addr => addr.id === value);
                                            onAddressSelect(address || null);
                                        }
                                    }}
                                >
                                    {addresses.map((address) => (
                                        <FormControlLabel
                                            key={address.id}
                                            value={address.id}
                                            control={<Radio />}
                                            label={
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {address.firstName} {address.lastName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {address.address}, {address.city}, {address.state} {address.postalCode}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    ))}
                                    <FormControlLabel
                                        value="new"
                                        control={<Radio />}
                                        label="Use a new address"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Box>
                    )}

                    {/* New Address Form */}
                    {useNewAddress && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                Shipping Address:
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        value={formData.shipping.firstName}
                                        onChange={(e) => onFormChange('shipping', 'firstName', e.target.value)}
                                        error={!!errors.firstName}
                                        helperText={errors.firstName}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        value={formData.shipping.lastName}
                                        onChange={(e) => onFormChange('shipping', 'lastName', e.target.value)}
                                        error={!!errors.lastName}
                                        helperText={errors.lastName}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Address"
                                        value={formData.shipping.address}
                                        onChange={(e) => onFormChange('shipping', 'address', e.target.value)}
                                        error={!!errors.address}
                                        helperText={errors.address}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="City"
                                        value={formData.shipping.city}
                                        onChange={(e) => onFormChange('shipping', 'city', e.target.value)}
                                        error={!!errors.city}
                                        helperText={errors.city}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <FormControl fullWidth required>
                                        <Select
                                            value={formData.shipping.state}
                                            onChange={(e) => onFormChange('shipping', 'state', e.target.value)}
                                            error={!!errors.state}
                                        >
                                            <MenuItem value="CA">California</MenuItem>
                                            <MenuItem value="NY">New York</MenuItem>
                                            <MenuItem value="TX">Texas</MenuItem>
                                            <MenuItem value="FL">Florida</MenuItem>
                                            <MenuItem value="IL">Illinois</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="ZIP Code"
                                        value={formData.shipping.zipCode}
                                        onChange={(e) => onFormChange('shipping', 'zipCode', e.target.value)}
                                        error={!!errors.zipCode}
                                        helperText={errors.zipCode}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        value={formData.shipping.phone}
                                        onChange={(e) => onFormChange('shipping', 'phone', e.target.value)}
                                        error={!!errors.phone}
                                        helperText={errors.phone}
                                        required
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {/* Shipping Method Selection */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Shipping Method:
                        </Typography>
                        <FormControl component="fieldset" fullWidth>
                            <RadioGroup
                                value={formData.shippingMethod}
                                onChange={(e) => onShippingMethodChange(e.target.value)}
                            >
                                {shippingMethods.map((method) => (
                                    <FormControlLabel
                                        key={method.id}
                                        value={method.id}
                                        control={<Radio />}
                                        label={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {method.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {method.time}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                    {method.cost === 0 ? 'FREE' : formatCurrency(method.cost)}
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{ 
                                            border: '1px solid #e0e0e0', 
                                            borderRadius: '8px', 
                                            m: 0.5, 
                                            p: 1,
                                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                                        }}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    {/* Continue Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                            variant="contained"
                            onClick={handleNextStep}
                            disabled={!validateShippingForm()}
                            sx={{ 
                                px: 4, 
                                py: 1.5,
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontSize: '1rem'
                            }}
                        >
                            Continue to Payment
                        </Button>
                    </Box>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default ShippingForm;
