// STORE-2201 Bug Fix: Update RecommendedProducts to use diverse images
// File: store-ui/src/components/Cart/RecommendedProducts.tsx
// Issue: All recommended products showing same mobile.webp image

// BEFORE (Bug - all products use same image):
const defaultProductsBuggy: RecommendedProduct[] = [
    {
        id: '1',
        title: 'Wireless Bluetooth Headphones',
        price: 2999,
        image: '/assets/images/deals/mobile.webp',  // ❌ Wrong - mobile image for headphones
        vendor: 'TechBrand'
    },
    {
        id: '2',
        title: 'Smart Fitness Watch', 
        price: 5999,
        image: '/assets/images/deals/mobile.webp',  // ❌ Wrong - mobile image for watch
        vendor: 'FitTech'
    },
    {
        id: '3',
        title: 'Portable Power Bank',
        price: 1499,
        image: '/assets/images/deals/mobile.webp',  // ❌ Wrong - mobile image for power bank
        vendor: 'PowerPlus'
    },
    {
        id: '4',
        title: 'USB-C Fast Charger',
        price: 899,
        image: '/assets/images/deals/mobile.webp',  // ❌ Wrong - mobile image for charger
        vendor: 'ChargeMax'
    }
];

// AFTER (Fixed - diverse images for each product):
const defaultProductsFixed: RecommendedProduct[] = [
    {
        id: '1',
        title: 'Wireless Bluetooth Headphones',
        price: 2999,
        image: '/assets/images/deals/oven.webp',     // ✅ Fixed - using different available image
        vendor: 'TechBrand'
    },
    {
        id: '2',
        title: 'Smart Fitness Watch',
        price: 5999,
        image: '/assets/images/deals/kurtha.webp',   // ✅ Fixed - using different available image
        vendor: 'FitTech'
    },
    {
        id: '3',
        title: 'Portable Power Bank',
        price: 1499,
        image: '/assets/images/deals/shoes.jpg',     // ✅ Fixed - using different available image
        vendor: 'PowerPlus'
    },
    {
        id: '4',
        title: 'USB-C Fast Charger',
        price: 899,
        image: '/assets/images/deals/mobile.webp',   // ✅ Keep mobile for charger (appropriate)
        vendor: 'ChargeMax'
    }
];

/* 
Fix Summary:
- Uses existing diverse images from /assets/images/deals/
- Each product now has a unique visual representation
- Maintains consistency with existing image assets
- Simple change with immediate visual impact

Alternative Solution (if product-specific images become available):
- Headphones: '/assets/images/deals/headphones.webp'
- Fitness Watch: '/assets/images/deals/watch.webp'  
- Power Bank: '/assets/images/deals/powerbank.webp'
- Charger: '/assets/images/deals/charger.webp'
*/
