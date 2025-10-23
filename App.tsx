import React, { useState, useCallback, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsListPage from './pages/ProductsListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AddStockMovementPage from './pages/AddStockMovementPage';
import AddProductPage from './pages/AddProductPage';
import OrdersPage from './pages/OrdersPage';
import AddOrderPage from './pages/AddOrderPage';
import ReportsPage from './pages/ReportsPage';
import BottomNav from './components/BottomNav';
import SideNav from './components/SideNav';
import WalkthroughGuide, { type Step as WalkthroughStep } from './components/WalkthroughGuide';
import type { Product, StockMovement, OverduePayment, Warehouse, Customer, Order, OrderItem } from './types';

export type Page = 'dashboard' | 'products' | 'orders' | 'reports' | 'add-stock' | 'product-detail' | 'add-product' | 'add-order';

const walkthroughSteps: (WalkthroughStep & { page?: Page })[] = [
  {
    title: "Bienvenue sur A-Cosmetic Stock !",
    text: "Suivez ce petit guide pour découvrir les fonctionnalités principales de votre nouvelle application de gestion.",
    position: 'center',
  },
  {
    title: "Tableau de bord",
    targetId: 'dashboard-page',
    text: "Ici, vous aurez une vue d'ensemble de vos stocks critiques, des paiements et des mouvements récents.",
    position: 'bottom',
    page: 'dashboard',
  },
  {
    title: "Catalogue Produits",
    targetId: 'products-nav-item',
    text: "Cliquez ici pour voir, ajouter ou gérer tous vos produits et leurs variantes.",
    position: 'top',
    page: 'products',
  },
   {
    title: "Ajouter un Produit",
    targetId: 'add-product-button',
    text: "C'est ici que vous commencez ! Cliquez pour ajouter votre premier produit et initialiser son stock.",
    position: 'bottom',
    page: 'products',
  },
  {
    title: "Gestion des Commandes",
    targetId: 'orders-nav-item',
    text: "Cette section vous permettra de gérer les commandes de vos clients.",
    position: 'top',
    page: 'orders',
  },
  {
    title: "Rapports & Exports",
    targetId: 'reports-nav-item',
    text: "Consultez les rapports de performance et exportez vos données en format CSV ou PDF.",
    position: 'top',
    page: 'reports',
  },
  {
    title: "Action Rapide",
    targetId: 'add-stock-button',
    text: "Utilisez ce bouton pour ajouter rapidement une entrée ou une sortie de stock.",
    position: 'top',
  },
  {
    title: "Vous êtes prêt !",
    text: "Vous avez maintenant les bases. Explorez l'application pour découvrir le reste. Bonnes ventes !",
    position: 'center',
  }
];


const App: React.FC = () => {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-700 mb-3">Erreur de Configuration</h1>
          <p className="text-gray-800">
            La connexion à la base de données Supabase n'est pas correctement configurée.
          </p>
          <p className="text-sm text-gray-600 mt-4">
            Veuillez vous assurer que les variables d'environnement <code className="bg-red-100 text-red-800 px-1 py-0.5 rounded">SUPABASE_URL</code> et <code className="bg-red-100 text-red-800 px-1 py-0.5 rounded">SUPABASE_KEY</code> sont définies avec vos identifiants de projet Supabase.
          </p>
        </div>
      </div>
    );
  }

  const [session, setSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [overduePayments, setOverduePayments] = useState<OverduePayment[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  // --- AUTH & DATA FETCHING ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchInitialData();
      const hasCompletedWalkthrough = localStorage.getItem('a-cosmetic-walkthrough-completed');
      if (!hasCompletedWalkthrough) {
        setShowWalkthrough(true);
      }
    }
  }, [session]);

  const fetchInitialData = async () => {
    setLoading(true);
    await fetchWarehouses(); // Must run first
    await Promise.all([
      fetchProductsAndStock(),
      fetchMovements(),
      fetchCustomers(),
      fetchOrders(),
    ]);
    setLoading(false);
  };

  const fetchWarehouses = async () => {
    if (!session?.user) return;
    
    const { data, error } = await supabase.from('warehouses').select('*');
    
    if (error) {
        console.error('Error fetching warehouses:', error.message);
        setWarehouses([]);
        return;
    }

    if (data && data.length === 0) {
        const { data: newWarehouse, error: createError } = await supabase
            .from('warehouses')
            .insert({ user_id: session.user.id, name: 'Entrepôt Principal', location: 'Non spécifié' })
            .select()
            .single();

        if (createError) {
            console.error('Failed to create default warehouse:', createError.message);
            setWarehouses([]);
        } else if (newWarehouse) {
            setWarehouses([newWarehouse]);
        }
    } else {
        setWarehouses(data || []);
    }
  };

  const fetchProductsAndStock = async () => {
     const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
            *,
            product_variants (
                *,
                stock_levels (*)
            )
        `);

    if (productsError) {
      console.error('Error fetching products', productsError.message);
      return;
    }

    const variantIds = productsData.flatMap(p => p.product_variants.map(v => v.id));
    if (variantIds.length === 0) {
       setProducts([]);
       return;
    }

    const { data: movementsData, error: movementsError } = await supabase
        .from('stock_movements')
        .select('*')
        .in('variant_id', variantIds);

    if (movementsError) {
        console.error('Error fetching movements for products', movementsError.message);
    }
    const movements = movementsData || [];

    const movementsByVariant = movements.reduce((acc, mov) => {
        if (mov.variant_id) {
            if (!acc[mov.variant_id]) acc[mov.variant_id] = [];
            acc[mov.variant_id].push(mov);
        }
        return acc;
    }, {} as Record<number, typeof movements>);


    const formattedProducts: Product[] = productsData.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        description: p.description,
        category: p.category,
        images: Array.isArray(p.images) ? p.images.filter((img): img is string => typeof img === 'string') : [],
        variants: p.product_variants.map(v => {
            const variantMovements = movementsByVariant[v.id] || [];

            const total_received = variantMovements
                .filter(m => (['in', 'purchase'].includes(m.movement_type) || (m.movement_type === 'adjustment' && m.quantity > 0)) && m.quantity > 0)
                .reduce((sum, m) => sum + m.quantity, 0);

            const total_shipped = variantMovements
                .filter(m => ['out', 'sale'].includes(m.movement_type))
                .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

            const total_damaged = variantMovements
                .filter(m => m.movement_type === 'damaged')
                .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

            const lastReceivedMovements = variantMovements
                .filter(m => ['in', 'purchase'].includes(m.movement_type) && m.quantity > 0)
                .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());

            const last_received_date = lastReceivedMovements.length > 0 ? lastReceivedMovements[0].created_at! : undefined;

            return {
                id: v.id,
                variant_name: v.variant_name,
                barcode: v.barcode,
                price: v.price || 0,
                total_received,
                total_shipped,
                total_damaged,
                last_received_date,
                stock_levels: v.stock_levels.map(sl => ({
                    warehouse_id: sl.warehouse_id,
                    warehouse_name: warehouses.find(w => w.id === sl.warehouse_id)?.name || 'Unknown',
                    quantity: sl.quantity || 0,
                    safety_stock: sl.safety_stock || 0,
                    initial_quantity: sl.initial_quantity || 0,
                    last_modified: sl.last_modified || new Date().toISOString()
                }))
            };
        })
    }));
    setProducts(formattedProducts);
  };
  
  const fetchMovements = async () => {
     const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
    if (error) console.error('Error fetching movements', error.message);
    else {
        const formattedMovements: StockMovement[] = data.map(m => ({
            id: m.id,
            productName: m.product_name_cache || 'N/A',
            variantName: m.variant_name_cache || 'N/A',
            sku: m.sku_cache,
            quantity: m.quantity,
            type: m.movement_type,
            date: m.created_at || new Date().toISOString(),
            reference: m.reference
        }));
        setStockMovements(formattedMovements);
    }
  };

  const fetchCustomers = async () => {
    const { data, error } = await supabase.from('customers').select('*');
    if (error) console.error('Error fetching customers', error.message);
    else setCustomers(data || []);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (name),
        order_items (
          *,
          product_variants (variant_name, products(name))
        )
      `)
      .order('order_date', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error.message);
    } else {
      const formattedOrders: Order[] = data.map(o => ({
        id: o.id,
        customer_name: (o.customers as { name: string })?.name || 'Client Inconnu',
        order_date: o.order_date,
        status: o.status,
        total_amount: o.total_amount,
        items: o.order_items.map((oi: any) => ({
          id: oi.id,
          product_name: oi.product_variants.products.name,
          variant_name: oi.product_variants.variant_name,
          quantity: oi.quantity,
          price: oi.price_at_time_of_order,
        }))
      }));
      setOrders(formattedOrders);
    }
  };

  // --- REALTIME SUBSCRIPTIONS ---
  useEffect(() => {
    if (!session) return;
    
    const changes = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('Change received!', payload)
        fetchInitialData(); // Refetch all data on any change
      })
      .subscribe()
    
      return () => {
        supabase.removeChannel(changes);
      }
  }, [session, supabase]);


  // --- WALKTHROUGH ---
  const handleNextStep = () => {
    const nextStepIndex = walkthroughStep + 1;
    const nextStep = walkthroughSteps[nextStepIndex];
    if (nextStep?.page && nextStep.page !== currentPage) {
        setCurrentPage(nextStep.page);
    }
    setWalkthroughStep(nextStepIndex);
  };
  const handleEndWalkthrough = () => {
    setShowWalkthrough(false);
    localStorage.setItem('a-cosmetic-walkthrough-completed', 'true');
  };

  // --- NAVIGATION & UI HANDLERS ---
  const handleNavigate = useCallback((page: Page) => setCurrentPage(page), []);
  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
  }, []);
  const handleBackToList = useCallback(() => {
    setSelectedProduct(null);
    setCurrentPage('products');
  }, []);


  // --- CRUD OPERATIONS ---
 const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    if (!session?.user) return;
    const { name, sku, description, category, images, variants } = newProduct;

    const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({ user_id: session.user.id, name, sku, description, category, images })
        .select()
        .single();
    if (productError || !productData) {
        console.error('Error creating product:', productError?.message);
        return;
    }

    const variantInserts = variants.map(v => ({
        product_id: productData.id,
        variant_name: v.variant_name,
        price: v.price,
        barcode: v.barcode
    }));
    const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantInserts)
        .select();
    if (variantsError || !variantsData) {
        console.error('Error creating variants:', variantsError?.message);
        return;
    }

    const stockLevelInserts = variants.flatMap((v, index) => 
        v.stock_levels.map(sl => ({
            variant_id: variantsData[index].id,
            warehouse_id: sl.warehouse_id,
            quantity: sl.quantity,
            initial_quantity: sl.quantity,
            safety_stock: sl.safety_stock,
            user_id: session.user.id
        }))
    );
     const { error: stockLevelError } = await supabase.from('stock_levels').insert(stockLevelInserts);
     if (stockLevelError) console.error('Error creating stock levels', stockLevelError.message);

    const movementInserts = variants.flatMap((v, index) => 
        v.stock_levels.map(sl => ({
            variant_id: variantsData[index].id,
            warehouse_id: sl.warehouse_id,
            quantity: sl.quantity,
            movement_type: 'in' as const,
            reference: 'Stock initial',
            user_id: session.user.id,
            product_name_cache: name,
            variant_name_cache: v.variant_name,
            sku_cache: sku
        }))
    ).filter(m => m.quantity > 0);

    if (movementInserts.length > 0) {
        const { error: movementsError } = await supabase.from('stock_movements').insert(movementInserts);
        if (movementsError) console.error('Error creating initial movements', movementsError.message);
    }

    setCurrentPage('products');
  };

  const handleAddStockMovement = async (movement: { variantId: number, warehouseId: number, quantity: number, type: 'in' | 'out' | 'adjustment' | 'damaged' | 'sale', reference: string }) => {
     if (!session?.user) return;
     const { variantId, warehouseId, quantity, type, reference } = movement;

    const { data: stockLevel, error: fetchError } = await supabase
        .from('stock_levels')
        .select('quantity')
        .eq('variant_id', variantId)
        .eq('warehouse_id', warehouseId)
        .single();
    if (fetchError) {
        console.error('Error fetching stock level:', fetchError.message);
        return;
    }
    
    if (type !== 'damaged') {
        const newQuantity = (stockLevel.quantity || 0) + quantity;
        const { error: updateError } = await supabase
            .from('stock_levels')
            .update({ quantity: newQuantity, last_modified: new Date().toISOString() })
            .eq('variant_id', variantId)
            .eq('warehouse_id', warehouseId);
        if (updateError) {
            console.error('Error updating stock level:', updateError.message);
            return;
        }
    }
    
    const productInfo = products.find(p => p.variants.some(v => v.id === variantId));
    const variantInfo = productInfo?.variants.find(v => v.id === variantId);

    const { error: insertError } = await supabase
        .from('stock_movements')
        .insert({
            variant_id: variantId,
            warehouse_id: warehouseId,
            quantity: quantity,
            movement_type: type,
            reference,
            user_id: session.user.id,
            product_name_cache: productInfo?.name,
            variant_name_cache: variantInfo?.variant_name,
            sku_cache: productInfo?.sku
        });
    if (insertError) console.error('Error logging movement:', insertError.message);

    setCurrentPage('dashboard');
  };
  
   const handleAddOrder = async (orderData: { customerName: string; items: { variantId: number; quantity: number; price: number }[]; total: number }) => {
    if (!session?.user || warehouses.length === 0) return;

    // 1. Find or Create Customer
    let customer;
    const { data: existingCustomer } = await supabase.from('customers').select('id').eq('name', orderData.customerName).single();

    if (existingCustomer) {
        customer = existingCustomer;
    } else {
        const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert({ name: orderData.customerName, user_id: session.user.id })
            .select('id')
            .single();
        if (customerError || !newCustomer) {
            console.error('Error creating customer:', customerError?.message);
            return;
        }
        customer = newCustomer;
    }
    const customerId = customer.id;

    // 2. Create Order
    const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
            customer_id: customerId,
            total_amount: orderData.total,
            status: 'pending',
            order_date: new Date().toISOString(),
            user_id: session.user.id,
        })
        .select()
        .single();

    if (orderError || !newOrder) {
        console.error('Error creating order:', orderError?.message);
        return;
    }

    // 3. Create Order Items
    const orderItemsToInsert = orderData.items.map(item => ({
        order_id: newOrder.id,
        variant_id: item.variantId,
        quantity: item.quantity,
        price_at_time_of_order: item.price,
        user_id: session.user.id,
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
    if (itemsError) {
        console.error('Error creating order items:', itemsError.message);
        // Potential rollback logic here
        return;
    }

    // 4. Create stock movements for each item
    for (const item of orderData.items) {
        await handleAddStockMovement({
            variantId: item.variantId,
            warehouseId: warehouses[0].id,
            quantity: -item.quantity, // Negative quantity for a sale
            type: 'sale',
            reference: `Commande #${newOrder.id}`,
        });
    }

    setCurrentPage('orders');
};


  // --- PAGE RENDERING ---
  const renderPage = () => {
    if(loading) return <div className="p-4 text-center">Chargement de vos données...</div>;

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage products={products} stockMovements={stockMovements} overduePayments={overduePayments} />;
      case 'products':
        return <ProductsListPage products={products} onSelectProduct={handleSelectProduct} onAddClick={() => handleNavigate('add-product')} />;
      case 'product-detail':
        return selectedProduct ? <ProductDetailPage product={selectedProduct} onBack={handleBackToList} /> : <ProductsListPage products={products} onSelectProduct={handleSelectProduct} onAddClick={() => handleNavigate('add-product')}/>;
      case 'add-stock':
        return <AddStockMovementPage products={products} warehouses={warehouses} onAddMovement={handleAddStockMovement} onBack={() => handleNavigate('dashboard')} />;
      case 'add-product':
        return <AddProductPage onAddProduct={handleAddProduct} warehouses={warehouses} onBack={() => handleNavigate('products')} />;
      case 'orders':
        return <OrdersPage orders={orders} onNavigate={handleNavigate} />;
      case 'add-order':
        return <AddOrderPage products={products} customers={customers} onAddOrder={handleAddOrder} onBack={() => handleNavigate('orders')} />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <DashboardPage products={products} stockMovements={stockMovements} overduePayments={overduePayments} />;
    }
  };

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
       {showWalkthrough && (
          <WalkthroughGuide
              stepConfig={walkthroughSteps[walkthroughStep]}
              isLastStep={walkthroughStep === walkthroughSteps.length - 1}
              onNext={handleNextStep}
              onSkip={handleEndWalkthrough}
              onDone={handleEndWalkthrough}
           />
      )}
      
      <div className="md:flex">
          <SideNav currentPage={currentPage} onNavigate={handleNavigate} />
          <main className="flex-1 pb-20 md:pb-0">
              {renderPage()}
          </main>
      </div>

      <div className="md:hidden">
          <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
      </div>
    </div>
  );
};

export default App;