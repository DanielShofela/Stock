import React, { useState, useCallback, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsListPage from './pages/ProductsListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AddStockMovementPage from './pages/AddStockMovementPage';
import AddProductPage from './pages/AddProductPage';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from './pages/ReportsPage';
import BottomNav from './components/BottomNav';
import WalkthroughGuide, { type Step as WalkthroughStep } from './components/WalkthroughGuide';
import type { Product, StockMovement, OverduePayment, Warehouse } from './types';

export type Page = 'dashboard' | 'products' | 'orders' | 'reports' | 'add-stock' | 'product-detail' | 'add-product';

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
  const [session, setSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [overduePayments, setOverduePayments] = useState<OverduePayment[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  // --- AUTH & DATA FETCHING ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
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
    await Promise.all([
      fetchWarehouses(),
      fetchProductsAndStock(),
      fetchMovements(),
    ]);
    setLoading(false);
  };

  const fetchWarehouses = async () => {
    const { data, error } = await supabase.from('warehouses').select('*');
    if (error) console.error('Error fetching warehouses:', error.message);
    else setWarehouses(data || []);
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

    const formattedProducts: Product[] = productsData.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        description: p.description,
        category: p.category,
        images: Array.isArray(p.images) ? p.images.filter((img): img is string => typeof img === 'string') : [],
        variants: p.product_variants.map(v => ({
            id: v.id,
            variant_name: v.variant_name,
            barcode: v.barcode,
            price: v.price || 0,
            stock_levels: v.stock_levels.map(sl => ({
                warehouse_id: sl.warehouse_id,
                warehouse_name: warehouses.find(w => w.id === sl.warehouse_id)?.name || 'Unknown',
                quantity: sl.quantity || 0,
                safety_stock: sl.safety_stock || 0,
                last_modified: sl.last_modified || new Date().toISOString()
            }))
        }))
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

  // --- REALTIME SUBSCRIPTIONS ---
  useEffect(() => {
    if (!session) return;
    
    const changes = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('Change received!', payload)
        fetchProductsAndStock();
        fetchMovements();
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

    // 1. Insert the main product
    const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({ user_id: session.user.id, name, sku, description, category, images })
        .select()
        .single();
    if (productError || !productData) {
        console.error('Error creating product:', productError?.message);
        return;
    }

    // 2. Insert variants
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

    // 3. Insert initial stock levels and movements
    const stockLevelInserts = variants.flatMap((v, index) => 
        v.stock_levels.map(sl => ({
            variant_id: variantsData[index].id,
            warehouse_id: sl.warehouse_id,
            quantity: sl.quantity,
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
    );
    const { error: movementsError } = await supabase.from('stock_movements').insert(movementInserts);
    if (movementsError) console.error('Error creating initial movements', movementsError.message);

    setCurrentPage('products');
  };

  const handleAddStockMovement = async (movement: { variantId: number, warehouseId: number, quantity: number, type: 'in' | 'out' | 'adjustment', reference: string }) => {
     if (!session?.user) return;
     const { variantId, warehouseId, quantity, type, reference } = movement;

     // Use an RPC function to handle this atomically in the future.
     // For now, client-side transaction:

     // 1. Get current stock
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
    
    // 2. Update stock level
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
    
    // 3. Log the movement
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

  // --- PAGE RENDERING ---
  const renderPage = () => {
    if(loading && !products.length) return <div className="p-4 text-center">Chargement de vos données...</div>;

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
        return <OrdersPage />;
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
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {showWalkthrough && (
          <WalkthroughGuide
              stepConfig={walkthroughSteps[walkthroughStep]}
              isLastStep={walkthroughStep === walkthroughSteps.length - 1}
              onNext={handleNextStep}
              onSkip={handleEndWalkthrough}
              onDone={handleEndWalkthrough}
           />
      )}
      <main className="flex-grow pb-20">
        {renderPage()}
      </main>
      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
};

export default App;