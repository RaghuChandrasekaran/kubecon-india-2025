import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './pages/Home/Home'
import Product from './pages/Product/Product'
import Cart from './pages/Cart/Cart'
import Checkout from './pages/Checkout/Checkout'
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation'
import UserPage from './pages/User/UserPage'
import UserListPage from './pages/User/UserListPage'
import Layout from './components/layout/Layout'

const App = (props: any) => {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/users" element={<UserListPage />} />
                <Route path="/user/new" element={<UserPage />} />
                <Route path="/user/:id" element={<UserPage />} />
            </Routes>
        </Layout>
    )
}
export default App