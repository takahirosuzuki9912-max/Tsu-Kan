import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import { 
  PlusCircle, 
  MinusCircle, 
  Calendar, 
  Package, 
  FileText, 
  TrendingUp, 
  List,
  Trash2,
  Save,
  DollarSign,
  Settings,
  ShieldCheck,
  UserCircle,
  Edit3,
  Lock,
  LogOut,
  Hash,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

// --- Firebase Configuration ---
// ★重要★: ここの設定をご自身のFirebaseのものに書き換えてください
const firebaseConfig = {
  apiKey: "AIzaSyCs_caRUymWCM-ZJqb3RUayy10ZYNw6S2E",
  authDomain: "hs-tsu-kan.firebaseapp.com",
  projectId: "hs-tsu-kan",
  storageBucket: "hs-tsu-kan.firebasestorage.app",
  messagingSenderId: "254611067252",
  appId: "1:254611067252:web:30bc519997efe0d0455c21"
}; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Types ---
type TransactionType = 'in' | 'out';

interface Transaction {
  id: string;
  date: string; 
  productId: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  timestamp: any;
  workerId?: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
}

// --- Helper Functions ---
const formatFlowValue = (val: number) => {
  if (val === 0) return '';
  if (val < 0) return `▲${Math.abs(val)}`;
  return val;
};

const formatCurrency = (val: number) => {
  return `¥${val.toLocaleString()}`;
};

// --- Login Component ---
const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-email') setError('メールアドレスの形式が正しくありません。');
      else if (err.code === 'auth/user-disabled') setError('このユーザーは無効化されています。');
      else if (err.code === 'auth/user-not-found') setError('ユーザーが見つかりません。');
      else if (err.code === 'auth/wrong-password') setError('パスワードが間違っています。');
      else if (err.code === 'auth/email-already-in-use') setError('このメールアドレスは既に使用されています。');
      else if (err.code === 'auth/weak-password') setError('パスワードは6文字以上で入力してください。');
      else if (err.code === 'auth/invalid-credential') setError('メールアドレスまたはパスワードが違います。');
      else setError('エラーが発生しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-4 border-blue-50">
        <div className="flex justify-center mb-6 text-blue-600">
          <div className="bg-blue-100 p-4 rounded-full">
            <Lock size={48} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {isLogin ? '在庫管理システム' : '新規アカウント登録'}
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          {isLogin ? 'メールアドレスとパスワードを入力してください' : '管理者用のアカウントを作成します'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 border border-red-200 font-bold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">メールアドレス</label>
            <input 
              type="email" 
              required 
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">パスワード</label>
            <input 
              type="password" 
              required 
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg"
              placeholder="6文字以上"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:bg-blue-300 text-lg"
          >
            {loading ? '処理中...' : (isLogin ? 'ログイン' : '登録する')}
          </button>
        </form>

        <div className="mt-8 text-center border-t pt-6">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm text-blue-600 hover:text-blue-800 font-bold underline"
          >
            {isLogin ? '初めての方はこちら（新規登録）' : 'ログイン画面に戻る'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function InventoryApp() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'input' | 'flow' | 'stock' | 'max' | 'products'>('input');
  
  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Global Settings State
  const [globalUnitPrice, setGlobalUnitPrice] = useState<number>(400);
  const [isUnitPriceEditing, setIsUnitPriceEditing] = useState(false);
  const [tempUnitPrice, setTempUnitPrice] = useState<number>(400);

  // Input Form State
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [inputType, setInputType] = useState<TransactionType>('in');
  const [inputQuantity, setInputQuantity] = useState<number>(1);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  // Product Management
  const [newProductName, setNewProductName] = useState('');
  const [newProductCodeMain, setNewProductCodeMain] = useState(''); 
  const [newProductCodeSub, setNewProductCodeSub] = useState('');

  // Report State
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();
  
  const getInitialTerm = () => {
    if (currentDay <= 10) return 1;
    if (currentDay <= 20) return 2;
    return 3;
  };

  const [reportDate, setReportDate] = useState({ year: currentYear, month: currentMonth });
  const [reportTerm, setReportTerm] = useState<1 | 2 | 3>(getInitialTerm() as 1 | 2 | 3);

  // --- Auth Check ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Real-time Data Sync ---
  useEffect(() => {
    if (!user) return;

    // 1. Transactions
    const qTrans = query(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'));
    const unsubTrans = onSnapshot(qTrans, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
      data.sort((a, b) => {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          const tA = a.timestamp?.seconds || 0;
          const tB = b.timestamp?.seconds || 0;
          return tB - tA;
      });
      setTransactions(data);
    });

    // 2. Products
    const qProd = query(collection(db, 'artifacts', appId, 'public', 'data', 'products'));
    const unsubProd = onSnapshot(qProd, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return { 
          id: doc.id, 
          name: d.name,
          code: d.code || ''
        };
      }) as Product[];
      
      data.sort((a, b) => {
        const codeA = a.code || '999999';
        const codeB = b.code || '999999';
        if (codeA !== codeB) return codeA.localeCompare(codeB);
        return a.name.localeCompare(b.name, 'ja');
      });
      
      setProducts(data);
      
      if (data.length > 0 && !selectedProduct) {
          setSelectedProduct(prev => prev || data[0].id);
      }
    });

    // 3. Global Settings
    const settingsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
    const unsubSettings = onSnapshot(settingsDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.unitPrice !== undefined) {
                setGlobalUnitPrice(data.unitPrice);
                if (!isUnitPriceEditing) setTempUnitPrice(data.unitPrice);
            }
        } else {
            setDoc(settingsDocRef, { unitPrice: 400 });
        }
    });

    return () => { unsubTrans(); unsubProd(); unsubSettings(); };
  }, [user, isUnitPriceEditing]);

  // --- Logic Functions ---

  const handleSignOut = () => {
    if(confirm('ログアウトしますか？')) signOut(auth);
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProduct) return;
    setSubmitStatus('saving');
    const product = products.find(p => p.id === selectedProduct);

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), {
        date: inputDate,
        productId: selectedProduct,
        productName: product?.name || 'Unknown',
        type: inputType,
        quantity: Number(inputQuantity),
        timestamp: serverTimestamp(),
        workerId: user.uid
      });
      setSubmitStatus('success');
      setInputQuantity(1);
      setTimeout(() => setSubmitStatus('idle'), 2000);
    } catch (error) {
      console.error(error);
      alert("保存エラー");
      setSubmitStatus('idle');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    
    let fullCode = '';
    if (newProductCodeMain || newProductCodeSub) {
      const codeMain = newProductCodeMain.padStart(3, '0');
      const codeSub = newProductCodeSub.padStart(3, '0');
      fullCode = `${codeMain}-${codeSub}`;
    }

    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), {
        name: newProductName.trim(),
        code: fullCode,
        created: serverTimestamp()
    });
    setNewProductName('');
    setNewProductCodeMain('');
    setNewProductCodeSub('');
    alert("商品を追加しました");
  };

  const handleDeleteProduct = async (id: string, name: string) => {
      if(!confirm(`商品「${name}」を本当に削除しますか？`)) return;
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id));
      } catch (err) {
        console.error(err);
        alert("削除に失敗しました");
      }
  };

  const handleDeleteTransaction = async (id: string) => {
    if(!confirm("削除しますか？")) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', id));
  };

  const saveUnitPrice = async () => {
      try {
          const settingsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
          await setDoc(settingsDocRef, { unitPrice: Number(tempUnitPrice) }, { merge: true });
          setIsUnitPriceEditing(false);
          setGlobalUnitPrice(Number(tempUnitPrice));
          alert("単価を更新しました");
      } catch (err) {
          console.error(err);
          alert("単価の保存に失敗しました");
      }
  };

  // --- Base Matrix Data (All Time) ---
  const allTimeMatrixData = useMemo(() => {
    const dateSet = new Set(transactions.map(t => t.date));
    const dates = Array.from(dateSet).sort();

    const flowMap: Record<string, Record<string, number>> = {};
    const stockMap: Record<string, Record<string, number>> = {};
    
    dates.forEach(d => {
        flowMap[d] = {};
        products.forEach(p => flowMap[d][p.id] = 0);
    });

    transactions.forEach(t => {
        if (!flowMap[t.date]) flowMap[t.date] = {};
        if (flowMap[t.date][t.productId] === undefined) flowMap[t.date][t.productId] = 0;
        
        if (t.type === 'in') {
            flowMap[t.date][t.productId] += t.quantity;
        } else {
            flowMap[t.date][t.productId] -= t.quantity;
        }
    });

    let currentStock: Record<string, number> = {};
    products.forEach(p => currentStock[p.id] = 0);

    dates.forEach(d => {
        stockMap[d] = {};
        products.forEach(p => {
            const dailyNet = flowMap[d][p.id] || 0;
            currentStock[p.id] += dailyNet;
            stockMap[d][p.id] = currentStock[p.id];
        });
    });

    return { dates, flowMap, stockMap };
  }, [transactions, products]);


  // --- Monthly & Term View Logic ---
  const monthlyViewData = useMemo(() => {
    const targetPrefix = `${reportDate.year}-${String(reportDate.month).padStart(2, '0')}`;
    const daysInMonth = new Date(reportDate.year, reportDate.month, 0).getDate();
    const dates = [];
    
    // Initial Stock Calculation
    const firstDayOfMonth = `${targetPrefix}-01`;
    const prevDates = allTimeMatrixData.dates.filter(d => d < firstDayOfMonth);
    
    let lastKnownStock: Record<string, number> = {};
    products.forEach(p => lastKnownStock[p.id] = 0);

    if (prevDates.length > 0) {
        const lastDate = prevDates[prevDates.length - 1];
        if (allTimeMatrixData.stockMap[lastDate]) {
            lastKnownStock = { ...allTimeMatrixData.stockMap[lastDate] };
        }
    }

    const dataByDate: Record<string, { flow: Record<string, number>, stock: Record<string, number> }> = {};

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${targetPrefix}-${String(d).padStart(2, '0')}`;
        
        const day = d;
        let isTargetTerm = false;
        if (reportTerm === 1 && day >= 1 && day <= 10) isTargetTerm = true;
        if (reportTerm === 2 && day >= 11 && day <= 20) isTargetTerm = true;
        if (reportTerm === 3 && day >= 21) isTargetTerm = true;

        if (isTargetTerm) {
            dates.push(dateStr);
        }
        
        dataByDate[dateStr] = { flow: {}, stock: {} };

        if (allTimeMatrixData.stockMap[dateStr]) {
            lastKnownStock = { ...allTimeMatrixData.stockMap[dateStr] };
        }

        products.forEach(p => {
            dataByDate[dateStr].flow[p.id] = allTimeMatrixData.flowMap[dateStr]?.[p.id] || 0;
            dataByDate[dateStr].stock[p.id] = lastKnownStock[p.id] || 0;
        });
    }

    // --- Term Start/End Stocks ---
    const startStock: Record<string, number> = {};
    const endStock: Record<string, number> = {};

    if (dates.length > 0) {
        const termStartDateStr = dates[0];
        const termEndDateStr = dates[dates.length - 1];

        // Start Stock (End of Previous Day)
        const startDateObj = new Date(termStartDateStr);
        startDateObj.setDate(startDateObj.getDate() - 1);
        const prevDateStr = startDateObj.toISOString().split('T')[0];

        // Helper to find stock at specific date
        const getStockAt = (targetDate: string) => {
            const historyDates = allTimeMatrixData.dates;
            const relevantDates = historyDates.filter(d => d <= targetDate);
            let lastDate = null;
            if (relevantDates.length > 0) lastDate = relevantDates[relevantDates.length - 1];
            
            const result: Record<string, number> = {};
            products.forEach(p => {
                if (lastDate && allTimeMatrixData.stockMap[lastDate]) {
                    result[p.id] = allTimeMatrixData.stockMap[lastDate][p.id] || 0;
                } else {
                    result[p.id] = 0;
                }
            });
            return result;
        };

        const startStockData = getStockAt(prevDateStr);
        const endStockData = getStockAt(termEndDateStr);
        
        products.forEach(p => {
            startStock[p.id] = startStockData[p.id];
            endStock[p.id] = endStockData[p.id];
        });

    } else {
        products.forEach(p => { startStock[p.id] = 0; endStock[p.id] = 0; });
    }

    return { dates, dataByDate, startStock, endStock };
  }, [reportDate, reportTerm, allTimeMatrixData, products]);


  // --- Totals Calculation ---
  const flowTotals = useMemo(() => {
    const dates = monthlyViewData.dates;
    const startTotal = Object.values(monthlyViewData.startStock).reduce((a, b) => a + b, 0);
    const endTotal = Object.values(monthlyViewData.endStock).reduce((a, b) => a + b, 0);
    
    const dateTotals: Record<string, number> = {};
    dates.forEach(date => {
        let sum = 0;
        products.forEach(p => {
            sum += monthlyViewData.dataByDate[date].flow[p.id] || 0;
        });
        dateTotals[date] = sum;
    });

    return { startTotal, endTotal, dateTotals };
  }, [monthlyViewData, products]);

  const stockTotals = useMemo(() => {
    const dates = monthlyViewData.dates;
    const dateTotals: Record<string, number> = {};
    dates.forEach(date => {
        let sum = 0;
        products.forEach(p => {
            sum += monthlyViewData.dataByDate[date].stock[p.id] || 0;
        });
        dateTotals[date] = sum;
    });
    return { dateTotals };
  }, [monthlyViewData, products]);

  // --- Max Stock / Invoice Logic ---
  // Fix ReferenceError: Move maxStockData definition BEFORE maxStockTotals
  const maxStockData = useMemo(() => {
    const targetPrefix = `${reportDate.year}-${String(reportDate.month).padStart(2, '0')}`;
    const daysInMonth = new Date(reportDate.year, reportDate.month, 0).getDate();
    
    const result: Record<string, { term1: number, term2: number, term3: number }> = {};
    products.forEach(p => { result[p.id] = { term1: 0, term2: 0, term3: 0 }; });

    const historyDates = allTimeMatrixData.dates;
    const firstDayOfMonth = `${targetPrefix}-01`;
    const prevDates = historyDates.filter(d => d < firstDayOfMonth);
    
    let lastKnownStock: Record<string, number> = {};
    products.forEach(p => lastKnownStock[p.id] = 0);

    if (prevDates.length > 0) {
        const lastDate = prevDates[prevDates.length - 1];
        if (allTimeMatrixData.stockMap[lastDate]) {
            lastKnownStock = { ...allTimeMatrixData.stockMap[lastDate] };
        }
    }

    const term1End = 10;
    const term2End = 20;

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${targetPrefix}-${String(d).padStart(2, '0')}`;
        if (allTimeMatrixData.stockMap[dateStr]) {
            lastKnownStock = { ...allTimeMatrixData.stockMap[dateStr] };
        }
        
        products.forEach(p => {
            const qty = lastKnownStock[p.id] || 0;
            if (d <= term1End) result[p.id].term1 = Math.max(result[p.id].term1, qty);
            else if (d <= term2End) result[p.id].term2 = Math.max(result[p.id].term2, qty);
            else result[p.id].term3 = Math.max(result[p.id].term3, qty);
        });
    }
    return result;
  }, [reportDate, allTimeMatrixData, products]);

  // Then define maxStockTotals which uses maxStockData
  const maxStockTotals = useMemo(() => {
    let term1Total = 0;
    let term2Total = 0;
    let term3Total = 0;
    let qtyTotal = 0;
    let amountTotal = 0;

    products.forEach(p => {
        const d = maxStockData[p.id];
        term1Total += d.term1;
        term2Total += d.term2;
        term3Total += d.term3;
        const tQty = d.term1 + d.term2 + d.term3;
        qtyTotal += tQty;
        amountTotal += tQty * globalUnitPrice;
    });

    return { term1Total, term2Total, term3Total, qtyTotal, amountTotal };
  }, [maxStockData, products, globalUnitPrice]);

  const invoiceTotal = useMemo(() => {
      let total = 0;
      products.forEach(p => {
          const d = maxStockData[p.id];
          const sumQty = d.term1 + d.term2 + d.term3;
          total += sumQty * globalUnitPrice;
      });
      return total;
  }, [maxStockData, products, globalUnitPrice]);

  // --- UI Components ---
  const TermSelector = () => (
    <div className="flex gap-2 w-full md:w-auto">
      {[1, 2, 3].map((term) => (
        <button
          key={term}
          onClick={() => setReportTerm(term as 1 | 2 | 3)}
          className={`flex-1 md:flex-none py-3 px-6 rounded-xl font-bold text-lg transition-all ${
            reportTerm === term 
              ? 'bg-blue-600 text-white shadow-md transform scale-105' 
              : 'bg-white text-gray-500 border-2 border-gray-200 hover:bg-gray-50'
          }`}
        >
          第{term}期
          <span className="block text-xs font-normal opacity-80">
            {term === 1 ? '1-10日' : term === 2 ? '11-20日' : '21-末日'}
          </span>
        </button>
      ))}
    </div>
  );

  // --- Render ---
  if (authLoading) return <div className="flex h-screen items-center justify-center text-blue-600 font-bold">起動中...</div>;
  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-800">
      
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Package size={24} />
          在庫管理
        </h1>
        <div className="flex items-center gap-2 opacity-90">
            <UserCircle size={20} />
            <span className="text-xs hidden sm:inline mr-2">{user.email}</span>
            <button onClick={handleSignOut} className="bg-blue-800 hover:bg-blue-900 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"><LogOut size={16} /> ログアウト</button>
        </div>
      </header>

      <main className="max-w-full mx-auto p-4">

        {/* INPUT TAB */}
        {activeTab === 'input' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in max-w-xl mx-auto border-4 border-blue-50">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-gray-800 border-b-4 border-blue-100 pb-4">
              <PlusCircle className="text-blue-600" size={32} />
              現場入力
            </h2>
            
            {products.length === 0 ? (
                <div className="text-center p-8 bg-yellow-50 rounded">
                    <p className="font-bold text-gray-600">商品がありません</p>
                    <button onClick={() => setActiveTab('products')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">商品登録へ移動</button>
                </div>
            ) : (
                <form onSubmit={handleTransactionSubmit} className="space-y-8">
                    <div>
                        <label className="block text-2xl font-bold text-gray-700 mb-3 flex items-center gap-2"><Calendar className="text-blue-500" size={32} /> 日付</label>
                        <input type="date" required value={inputDate} onChange={e => setInputDate(e.target.value)} className="w-full p-6 bg-blue-50 rounded-2xl text-4xl font-bold text-gray-900 border-4 border-blue-100 focus:border-blue-500 focus:bg-white transition-all shadow-sm h-28" />
                    </div>
                    <div>
                        <label className="block text-2xl font-bold text-gray-700 mb-3 flex items-center gap-2"><Package className="text-blue-500" size={32} /> 商品</label>
                        <div className="relative">
                            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full p-6 bg-blue-50 rounded-2xl text-4xl font-bold text-gray-900 border-4 border-blue-100 focus:border-blue-500 focus:bg-white transition-all appearance-none shadow-sm h-28">
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 pointer-events-none text-blue-400">▼</div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-2xl font-bold text-gray-700 mb-3">区分</label>
                        <div className="grid grid-cols-2 gap-6">
                            <button type="button" onClick={() => setInputType('in')} className={`p-8 rounded-2xl flex flex-col items-center gap-4 transition-all transform duration-200 ${inputType === 'in' ? 'bg-blue-600 text-white shadow-xl scale-105 ring-4 ring-blue-300' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}><PlusCircle size={64} /><span className="font-bold text-3xl">入荷</span></button>
                            <button type="button" onClick={() => setInputType('out')} className={`p-8 rounded-2xl flex flex-col items-center gap-4 transition-all transform duration-200 ${inputType === 'out' ? 'bg-red-500 text-white shadow-xl scale-105 ring-4 ring-red-300' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}><MinusCircle size={64} /><span className="font-bold text-3xl">出荷</span></button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-2xl font-bold text-gray-700 mb-3">数量</label>
                        <input type="number" min="1" required value={inputQuantity} onChange={e => setInputQuantity(Number(e.target.value))} className="w-full p-6 bg-gray-50 rounded-2xl text-6xl text-center font-bold border-4 border-gray-200 focus:border-blue-500 focus:bg-white transition-all shadow-inner h-32" />
                    </div>
                    <button type="submit" disabled={submitStatus === 'saving'} className={`w-full py-8 rounded-2xl font-bold text-3xl shadow-xl flex items-center justify-center gap-4 text-white transition-all transform duration-200 ${submitStatus === 'success' ? 'bg-green-500 scale-95' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}>
                        {submitStatus === 'saving' ? '送信中...' : submitStatus === 'success' ? '完了！' : '記録する'} <Save size={36} />
                    </button>
                </form>
            )}
          </div>
        )}

        {/* FLOW TAB */}
        {activeTab === 'flow' && (
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-full mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 border-b pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-700 whitespace-nowrap">
                    <List className="text-blue-600" size={28} /> 入出庫
                </h2>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <input type="month" className="border-2 border-gray-200 rounded-xl p-3 text-xl font-bold text-gray-700"
                        value={`${reportDate.year}-${String(reportDate.month).padStart(2, '0')}`}
                        onChange={e => {
                            const d = new Date(e.target.value);
                            if(!isNaN(d.getTime())) setReportDate({ year: d.getFullYear(), month: d.getMonth() + 1 });
                        }}
                    />
                    <TermSelector />
                </div>
            </div>
            
            <div className="overflow-x-auto pb-4">
                <table className="w-full text-left text-base border-collapse whitespace-nowrap">
                    <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            <th className="p-3 border sticky left-0 bg-gray-100 z-10 w-60 shadow-sm font-bold text-lg">商品コード/名 \ 日付</th>
                            <th className="p-3 border text-center font-bold bg-blue-50 text-blue-800 min-w-[60px] text-lg">前残</th>
                            {monthlyViewData.dates.map(date => {
                                const day = date.split('-')[2];
                                return <th key={date} className="p-3 border text-center font-mono min-w-[50px] font-bold text-xl">{day}</th>;
                            })}
                            <th className="p-3 border text-center font-bold bg-blue-50 text-blue-800 min-w-[60px] text-lg">現残</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="p-3 border font-bold sticky left-0 bg-white z-10 shadow-sm">
                                  <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">{p.code}</span>
                                    <span className="text-lg">{p.name}</span>
                                  </div>
                                </td>
                                <td className="p-3 border text-center font-mono font-bold bg-blue-50 text-gray-800 text-xl">
                                    {monthlyViewData.startStock[p.id]}
                                </td>
                                {monthlyViewData.dates.map(date => {
                                    const val = monthlyViewData.dataByDate[date].flow[p.id];
                                    const formattedVal = formatFlowValue(val);
                                    return (
                                        <td key={date} className={`p-3 border text-center font-mono text-xl ${val < 0 ? 'text-red-600 font-bold' : val > 0 ? 'text-blue-600' : 'text-gray-300'}`}>
                                            {formattedVal}
                                        </td>
                                    );
                                })}
                                <td className="p-3 border text-center font-mono font-bold bg-blue-50 text-gray-800 text-xl">
                                    {monthlyViewData.endStock[p.id]}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold text-gray-800">
                        <tr>
                            <td className="p-3 border sticky left-0 bg-gray-100 z-10 shadow-sm text-lg">合計</td>
                            <td className="p-3 border text-center font-mono text-xl">{flowTotals.startTotal}</td>
                            {monthlyViewData.dates.map(date => {
                                const val = flowTotals.dateTotals[date];
                                const formattedVal = formatFlowValue(val);
                                return <td key={date} className={`p-3 border text-center font-mono text-xl ${val < 0 ? 'text-red-600' : 'text-blue-600'}`}>{formattedVal}</td>;
                            })}
                            <td className="p-3 border text-center font-mono text-xl">{flowTotals.endTotal}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
          </div>
        )}

        {/* STOCK TAB */}
        {activeTab === 'stock' && (
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-full mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 border-b pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-700 whitespace-nowrap">
                    <TrendingUp className="text-blue-600" size={28} /> 在庫残高
                </h2>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <input type="month" className="border-2 border-gray-200 rounded-xl p-3 text-xl font-bold text-gray-700"
                        value={`${reportDate.year}-${String(reportDate.month).padStart(2, '0')}`}
                        onChange={e => {
                            const d = new Date(e.target.value);
                            if(!isNaN(d.getTime())) setReportDate({ year: d.getFullYear(), month: d.getMonth() + 1 });
                        }}
                    />
                    <TermSelector />
                </div>
            </div>

            <div className="overflow-x-auto pb-4">
                <table className="w-full text-left text-base border-collapse whitespace-nowrap">
                    <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            <th className="p-3 border sticky left-0 bg-gray-100 z-10 w-60 shadow-sm font-bold text-lg">商品コード/名 \ 日付</th>
                            {monthlyViewData.dates.map(date => {
                                const day = date.split('-')[2];
                                return <th key={date} className="p-3 border text-center font-mono min-w-[50px] font-bold text-xl">{day}</th>;
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="p-3 border font-bold sticky left-0 bg-white z-10 shadow-sm">
                                  <div className="flex flex-col">
                                    <span className="text-sm text-gray-500">{p.code}</span>
                                    <span className="text-lg">{p.name}</span>
                                  </div>
                                </td>
                                {monthlyViewData.dates.map(date => {
                                    const val = monthlyViewData.dataByDate[date].stock[p.id];
                                    return (
                                        <td key={date} className="p-3 border text-center font-mono font-bold text-gray-800 text-xl">
                                            {val}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold text-gray-800">
                        <tr>
                            <td className="p-3 border sticky left-0 bg-gray-100 z-10 shadow-sm text-lg">合計</td>
                            {monthlyViewData.dates.map(date => (
                                <td key={date} className="p-3 border text-center font-mono text-xl">{stockTotals.dateTotals[date]}</td>
                            ))}
                        </tr>
                    </tfoot>
                </table>
            </div>
          </div>
        )}

        {/* INVOICE TAB */}
        {activeTab === 'max' && (
           <div className="space-y-6 max-w-4xl mx-auto">
             <div className="bg-white p-4 rounded-xl shadow flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <label className="font-bold text-gray-700">請求月:</label>
                    <input type="month" className="border rounded p-2 text-lg"
                        value={`${reportDate.year}-${String(reportDate.month).padStart(2, '0')}`}
                        onChange={e => {
                            const d = new Date(e.target.value);
                            if(!isNaN(d.getTime())) setReportDate({ year: d.getFullYear(), month: d.getMonth() + 1 });
                        }}
                    />
                </div>

                <div className="flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-100">
                    <label className="font-bold text-gray-700 text-sm">保管料単価 (一律):</label>
                    {isUnitPriceEditing ? (
                        <div className="flex gap-1">
                            <input 
                                type="number" 
                                className="w-24 border rounded p-1 text-right font-bold"
                                value={tempUnitPrice}
                                onChange={(e) => setTempUnitPrice(Number(e.target.value))}
                            />
                            <button onClick={saveUnitPrice} className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">保存</button>
                            <button onClick={() => setIsUnitPriceEditing(false)} className="text-gray-500 px-2 py-1 text-xs">キャンセル</button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-blue-800">{formatCurrency(globalUnitPrice)}</span>
                            <button onClick={() => { setTempUnitPrice(globalUnitPrice); setIsUnitPriceEditing(true); }} className="text-gray-400 hover:text-blue-600">
                                <Edit3 size={16} />
                            </button>
                        </div>
                    )}
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
                    <ShieldCheck className="text-blue-600" /> 最大在庫計算・請求内訳
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-base border-collapse">
                        <thead className="bg-blue-50 text-blue-800">
                            <tr>
                                <th className="p-3 border text-lg">商品コード/名</th>
                                <th className="p-3 border text-right text-lg">第1期<br/>(1-10)</th>
                                <th className="p-3 border text-right text-lg">第2期<br/>(11-20)</th>
                                <th className="p-3 border text-right text-lg">第3期<br/>(21-末)</th>
                                <th className="p-3 border text-right font-bold text-lg">合計数</th>
                                <th className="p-3 border text-right text-lg">単価</th>
                                <th className="p-3 border text-right bg-blue-100 font-bold text-lg">金額</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => {
                                const d = maxStockData[p.id];
                                const totalQty = d.term1 + d.term2 + d.term3;
                                const amount = totalQty * globalUnitPrice;
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="p-3 border font-bold">
                                          <div className="flex flex-col">
                                            <span className="text-sm text-gray-500 font-normal">{p.code}</span>
                                            <span className="text-lg">{p.name}</span>
                                          </div>
                                        </td>
                                        <td className="p-3 border text-right text-xl">{d.term1}</td>
                                        <td className="p-3 border text-right text-xl">{d.term2}</td>
                                        <td className="p-3 border text-right text-xl">{d.term3}</td>
                                        <td className="p-3 border text-right font-bold text-xl">{totalQty}</td>
                                        <td className="p-3 border text-right text-gray-600 text-lg">{formatCurrency(globalUnitPrice)}</td>
                                        <td className="p-3 border text-right font-bold bg-blue-50 text-blue-700 text-xl">
                                            {formatCurrency(amount)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-blue-100 font-bold text-blue-900">
                            <tr>
                                <td className="p-3 border text-lg">合計</td>
                                <td className="p-3 border text-right text-xl">{maxStockTotals.term1Total}</td>
                                <td className="p-3 border text-right text-xl">{maxStockTotals.term2Total}</td>
                                <td className="p-3 border text-right text-xl">{maxStockTotals.term3Total}</td>
                                <td className="p-3 border text-right text-xl">{maxStockTotals.qtyTotal}</td>
                                <td className="p-3 border text-right text-lg">-</td>
                                <td className="p-3 border text-right text-xl">{formatCurrency(maxStockTotals.amountTotal)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
                 <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
                    <DollarSign className="text-green-600" /> 請求書プレビュー
                 </h2>
                 <div className="flex justify-between items-end p-4 bg-gray-50 rounded-lg">
                     <div>
                         <p className="text-sm text-gray-500">ご請求金額合計 (単価 {formatCurrency(globalUnitPrice)})</p>
                         <p className="text-3xl font-bold text-gray-800">{formatCurrency(invoiceTotal)}</p>
                     </div>
                     <button className="text-sm text-blue-600 underline" onClick={() => window.print()}>印刷する</button>
                 </div>
             </div>
           </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in max-w-4xl mx-auto">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-700 border-b pb-2">
                    <Settings className="text-blue-600" /> 商品マスター
                </h2>
                
                <form onSubmit={handleAddProduct} className="flex flex-col gap-4 mb-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex flex-1 gap-2 items-center">
                            <Hash size={20} className="text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="001" 
                                className="w-16 p-3 border rounded-lg text-center"
                                value={newProductCodeMain} 
                                onChange={e => setNewProductCodeMain(e.target.value)} 
                                maxLength={3}
                            />
                            <span className="text-gray-400">-</span>
                            <input 
                                type="text" 
                                placeholder="001" 
                                className="w-16 p-3 border rounded-lg text-center"
                                value={newProductCodeSub} 
                                onChange={e => setNewProductCodeSub(e.target.value)} 
                                maxLength={3}
                            />
                        </div>
                        <input 
                            type="text" 
                            placeholder="商品名 (例: 商品A)" 
                            className="flex-[2] p-3 border rounded-lg"
                            value={newProductName} 
                            onChange={e => setNewProductName(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold w-full md:w-auto self-end flex items-center justify-center gap-2">
                        <PlusCircle size={20} />
                        商品を追加
                    </button>
                </form>

                <div className="border rounded-lg divide-y bg-white">
                    <div className="bg-gray-50 p-3 text-xs font-bold text-gray-500 flex">
                        <span className="w-24">コード</span>
                        <span className="flex-1">商品名</span>
                        <span className="w-10"></span>
                    </div>
                    {products.map(p => (
                        <div key={p.id} className="p-4 flex items-center hover:bg-gray-50">
                            <span className="w-24 font-mono font-bold text-blue-600">{p.code || '---'}</span>
                            <span className="flex-1 font-bold text-lg">{p.name}</span>
                            <button 
                                onClick={() => handleDeleteProduct(p.id, p.name)} 
                                className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
                                title="削除"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                    {products.length === 0 && <p className="p-8 text-center text-gray-400">商品がありません</p>}
                </div>
            </div>
        )}

      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
        <NavButton active={activeTab === 'input'} onClick={() => setActiveTab('input')} icon={<PlusCircle />} label="入力" />
        <NavButton active={activeTab === 'flow'} onClick={() => setActiveTab('flow')} icon={<List />} label="入出庫" />
        <NavButton active={activeTab === 'stock'} onClick={() => setActiveTab('stock')} icon={<TrendingUp />} label="在庫" />
        <NavButton active={activeTab === 'max'} onClick={() => setActiveTab('max')} icon={<FileText />} label="請求" />
        <NavButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Settings />} label="商品" />
      </nav>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-1 rounded-lg transition-all duration-200 ${active ? 'text-blue-600 bg-blue-50 transform -translate-y-1' : 'text-gray-400 hover:text-gray-600'}`}>
    <div className={`mb-1 ${active ? 'scale-110' : ''}`}>{icon}</div>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);