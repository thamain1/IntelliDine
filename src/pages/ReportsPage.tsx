import { BarChart, LineChart, PieChart, XAxis, YAxis, Tooltip, CartesianGrid, Bar, Line, Pie, Cell, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; // Ensure this path is correct

export function Card({ children, className }) {
  return <div className={`bg-white p-6 rounded-lg shadow ${className}`}>{children}</div>;
}

export function CardContent({ children }) {
  return <div className="p-6">{children}</div>;
}

export function ReportsPage() {
  const [salesData, setSalesData] = useState([]);
  const [laborData, setLaborData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [customerSatisfaction, setCustomerSatisfaction] = useState({
    averageRating: 0,
    totalResponses: 0,
    ratingDistribution: [],
  });
  const [topMenuItems, setTopMenuItems] = useState([]);
  const [selectedRange, setSelectedRange] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackInsights, setFeedbackInsights] = useState({
    topWords: [], // Top 10 most frequent words
    commonThemes: [], // Common themes in feedback
  });
  const [selectedSentiment, setSelectedSentiment] = useState("all"); // Dropdown for sentiment filtering
  const [allFeedback, setAllFeedback] = useState([]); // All feedback data
  const [filteredFeedback, setFilteredFeedback] = useState([]); // Feedback filtered by sentiment
  const [selectedOrderType, setSelectedOrderType] = useState('All');
  const [selectedEmployeeTimeRange, setSelectedEmployeeTimeRange] = useState('week');
  const [employeeOrdersData, setEmployeeOrdersData] = useState([]);
  const [employeeOrdersLoading, setEmployeeOrdersLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchEmployeeOrders();
  }, [selectedRange, selectedEmployeeTimeRange, selectedOrderType]);

  const fetchData = async () => {
    console.log("Fetching data...");
    try {
      setIsLoading(true);
      setError(null);

      // Calculate start date based on selected range
      const date = new Date();
      let startDate = new Date();
      if (selectedRange === 'day') {
        startDate.setDate(date.getDate() - 1);
      } else if (selectedRange === 'week') {
        startDate.setDate(date.getDate() - 7);
      } else if (selectedRange === 'month') {
        startDate.setDate(date.getDate() - 30);
      } else if (selectedRange === 'year') {
        startDate.setFullYear(date.getFullYear() - 1);
      }

      // Fetch sales data
      const { data: sales, error: salesError } = await supabase
        .from("orders")
        .select("time, total, type, items")
        .gte("time", startDate.toISOString());

      if (salesError) throw new Error(`Sales Data Fetch Error: ${salesError.message}`);

      // Aggregate sales by date
      const aggregatedSales = sales.reduce((acc, order) => {
        const date = new Date(order.time).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, total: 0 };
        }
        acc[date].total += order.total;
        return acc;
      }, {});

      setSalesData(Object.values(aggregatedSales));

      // Fetch labor data
      const { data: labor, error: laborError } = await supabase
        .from("labor")
        .select("category, hours, cost, revenue");

      if (laborError) throw new Error(`Labor Data Fetch Error: ${laborError.message}`);
      setLaborData(labor ?? []);

      // Fetch inventory data
      const { data: inventory, error: inventoryError } = await supabase
        .from("inventory")
        .select("name, quantity, wastage, unit_cost, category");

      if (inventoryError) throw new Error(`Inventory Data Fetch Error: ${inventoryError.message}`);

      // Format inventory data for the pie chart
      const formattedInventoryData = inventory.map(item => ({
        name: item.name,
        wastage: parseFloat(item.wastage), // Ensure wastage is a number
        category: item.category,
      }));

      setInventoryData(formattedInventoryData);

      // Fetch financial data for profit calculation
      const { data: financials, error: financialError } = await supabase
        .from("orders")
        .select("time, total");

      if (financialError) throw new Error(`Financial Data Fetch Error: ${financialError.message}`);

      // Calculate profit (assuming 30% cost) and aggregate by date
      const profitByDate = financials.reduce((acc, order) => {
        const date = new Date(order.time).toISOString().split('T')[0]; // Extract date (YYYY-MM-DD)
        const profit = (order.total ?? 0) * 0.7; // Profit = Total - 30% cost

        if (!acc[date]) {
          acc[date] = { date, profit: 0 };
        }
        acc[date].profit += profit; // Sum profits for the same date
        return acc;
      }, {});

      // Convert the aggregated data into an array
      const calculatedProfit = Object.values(profitByDate);

      setProfitData(calculatedProfit);

      // Fetch customer satisfaction data
      const { data: satisfaction, error: satisfactionError } = await supabase
        .from("customer_feedback")
        .select("rating, date, feedback"); // Correct column name

      if (satisfactionError) throw new Error(`Customer Satisfaction Fetch Error: ${satisfactionError.message}`);

      // Calculate average rating and total responses
      const totalRating = satisfaction.reduce((sum, feedback) => sum + (feedback.rating ?? 0), 0);
      const averageRating = satisfaction.length > 0 ? (totalRating / satisfaction.length).toFixed(2) : 0;
      const totalResponses = satisfaction.length;

      // Calculate rating distribution
      const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        count: satisfaction.filter((feedback) => feedback.rating === rating).length,
      }));

      // Set all feedback data
      setAllFeedback(satisfaction);
      setFilteredFeedback(satisfaction);

      // Analyze feedback text for insights
      const insights = analyzeFeedbackText(satisfaction.map((feedback) => feedback.feedback).join(" "));
      setFeedbackInsights(insights);

      setCustomerSatisfaction({ averageRating, totalResponses, ratingDistribution });

      // Fetch top menu items sold by category
      const { data: menuItems, error: menuItemsError } = await supabase
        .from("menu_items")
        .select("name, category");

      if (menuItemsError) throw new Error(`Menu Items Fetch Error: ${menuItemsError.message}`);

      // Aggregate top menu items by category
      const topItemsByCategory = menuItems.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = { category: item.category, items: [] };
        }
        acc[item.category].items.push(item.name);
        return acc;
      }, {});

      setTopMenuItems(Object.values(topItemsByCategory));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeeOrders = async () => {
    try {
      setEmployeeOrdersLoading(true);
      const date = new Date();
      let startDate = new Date();
      switch (selectedEmployeeTimeRange) {
        case 'day': startDate.setDate(date.getDate() - 1); break;
        case 'week': startDate.setDate(date.getDate() - 7); break;
        case 'month': startDate.setDate(date.getDate() - 30); break;
        case 'year': startDate.setFullYear(date.getFullYear() - 1); break;
        default: startDate = new Date(0);
      }

      let query = supabase
        .from("orders")
        .select(`employee_id, type, total, time, employees ( name )`)
        .gte("time", startDate.toISOString());

      if (selectedOrderType !== 'All') {
        query = query.eq("type", selectedOrderType);
      }

      const { data: orders, error } = await query;
      if (error) throw new Error(`Employee Orders Error: ${error.message}`);

      const grouped = orders.reduce((acc, order) => {
        const key = order.employee_id;
        if (!acc[key]) {
          acc[key] = {
            name: order.employees?.name || 'Unknown',
            totalSales: 0,
            orderTypes: {},
          };
        }
        acc[key].totalSales += order.total || 0;
        const type = order.type || 'Unknown';
        acc[key].orderTypes[type] = (acc[key].orderTypes[type] || 0) + 1;
        return acc;
      }, {});

      const possibleOrderTypes = ['in-house', 'pickup', 'delivery'];
      const processedData = Object.values(grouped).map(emp => ({
        name: emp.name,
        ...possibleOrderTypes.reduce((acc, type) => {
          acc[type] = emp.orderTypes[type] || 0;
          return acc;
        }, {}),
        totalSales: emp.totalSales,
      }));

      setEmployeeOrdersData(processedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setEmployeeOrdersLoading(false);
    }
  };

  // Function to analyze feedback text and extract insights
  const analyzeFeedbackText = (text) => {
    const words = text.toLowerCase().split(/\s+/); // Split text into words
    const wordCount = {};

    // Count word frequency
    words.forEach((word) => {
      if (word.length > 3) { // Ignore short words (e.g., "and", "the")
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    // Sort words by frequency and get top 10
    const topWords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([text, value]) => ({ text, value }));

    // Identify common themes
    const themes = {
      service: ["service", "staff", "waiter", "friendly"],
      food: ["food", "taste", "delicious", "quality"],
      ambiance: ["ambiance", "atmosphere", "decor", "music"],
    };

    const commonThemes = Object.entries(themes).map(([theme, keywords]) => ({
      theme,
      count: keywords.reduce((sum, keyword) => sum + (wordCount[keyword] || 0), 0),
    }));

    return { topWords, commonThemes };
  };

  // Function to filter feedback by sentiment
  const filterFeedbackBySentiment = (sentiment) => {
    let filtered = allFeedback;
    if (sentiment !== "all") {
      filtered = allFeedback.filter((feedback) => {
        const feedbackText = feedback.feedback.toLowerCase();
        const positiveWords = ["good", "great", "excellent", "amazing", "love"];
        const negativeWords = ["bad", "poor", "terrible", "disappointing", "hate"];

        if (sentiment === "positive") {
          return positiveWords.some((word) => feedbackText.includes(word));
        } else if (sentiment === "negative") {
          return negativeWords.some((word) => feedbackText.includes(word));
        } else if (sentiment === "neutral") {
          return !positiveWords.some((word) => feedbackText.includes(word)) &&
                 !negativeWords.some((word) => feedbackText.includes(word));
        }
        return true;
      });
    }
    setFilteredFeedback(filtered);

    // Recalculate insights based on filtered feedback
    const feedbackText = filtered.map((feedback) => feedback.feedback).join(" ");
    const insights = analyzeFeedbackText(feedbackText);
    setFeedbackInsights(insights);
  };

  // Handle sentiment filter change
  const handleSentimentChange = (e) => {
    const sentiment = e.target.value;
    setSelectedSentiment(sentiment);
    filterFeedbackBySentiment(sentiment);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-600">Loading data...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div>
      <button onClick={() => window.history.back()} className="bg-blue-500 text-white px-4 py-2 rounded mb-4 ml-8">
        Back
      </button>
      <div className="grid grid-cols-2 gap-6 p-8">
        {/* Sales Overview */}
        <Card className="col-span-2">
          <CardContent>
            <h2 className="text-xl font-bold">Sales Overview</h2>
            <select
              className="border rounded px-2 py-1 mb-4"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Labor Costs vs Revenue */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold">Labor Costs vs Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={laborData}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cost" fill="#ff7300" />
                <Bar dataKey="revenue" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Food Wastage */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold">Food Wastage</h2>
            <select
              className="border rounded px-2 py-1 mb-4"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Beverages">Beverages</option>
              <option value="Dairy">Dairy</option>
              <option value="Meat">Meat</option>
              <option value="Spices">Spices</option>
              <option value="Vegetables">Vegetables</option>
            </select>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={inventoryData.filter(i => selectedCategory === 'All' || i.category === selectedCategory)}
                  dataKey="wastage"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#ff4444"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#FFBB28", "#FF8042", "#0088FE", "#00C49F"][index % 4]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profitability */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold">Profitability</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={profitData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Feedback KPI */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-bold">Customer Feedback</h2>
            <div className="text-3xl font-bold text-blue-500">
              {customerSatisfaction.averageRating} / 5
            </div>
            <p className="text-sm text-gray-600">Average Rating ({customerSatisfaction.totalResponses} responses)</p>
            <div className="mt-4">
              <h3 className="text-md font-semibold">Rating Distribution</h3>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {customerSatisfaction.ratingDistribution.map(({ rating, count }) => (
                  <div key={rating} className="text-center">
                    <div className="text-lg font-bold">{count}</div>
                    <div className="text-sm text-gray-600">{rating} Star{rating !== 1 ? 's' : ''}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-md font-semibold">Feedback Insights</h3>
              <select
                className="border rounded px-2 py-1 mb-4"
                value={selectedSentiment}
                onChange={handleSentimentChange}
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
              <div className="mt-2">
                <h4 className="text-sm font-semibold">Top 10 Words</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {feedbackInsights.topWords.map((word, index) => (
                    <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {word.text} ({word.value})
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold">Common Themes</h4>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {feedbackInsights.commonThemes.map((theme, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      <div className="text-sm font-semibold">{theme.theme}</div>
                      <div className="text-sm text-gray-600">{theme.count} mentions</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Menu Items Sold by Category */}
        <Card className="col-span-2">
          <CardContent>
            <h2 className="text-xl font-bold">Top Menu Items Sold by Category</h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {topMenuItems.map((category) => (
                <div key={category.category} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold">{category.category}</h3>
                  <ul className="mt-2">
                    {category.items.slice(0, 5).map((item, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Employee Performance Card */}
        <Card className="col-span-2">
          <CardContent>
            <h2 className="text-xl font-bold mb-4">Employee Order Performance</h2>
            <div className="flex gap-4 mb-6">
              <select
                className="border rounded px-3 py-2"
                value={selectedOrderType}
                onChange={(e) => setSelectedOrderType(e.target.value)}
              >
                <option value="All">All Order Types</option>
                <option value="in-house">In-House</option>
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
              <select
                className="border rounded px-3 py-2"
                value={selectedEmployeeTimeRange}
                onChange={(e) => setSelectedEmployeeTimeRange(e.target.value)}
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>

            {employeeOrdersLoading ? (
              <div className="text-center text-gray-500">Loading employee performance data...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={employeeOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" label={{ value: 'Orders', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Sales', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="in-house" stackId="a" fill="#8884d8" name="In-House Orders" />
                  <Bar yAxisId="left" dataKey="pickup" stackId="a" fill="#82ca9d" name="Pickup Orders" />
                  <Bar yAxisId="left" dataKey="delivery" stackId="a" fill="#ffc658" name="Delivery Orders" />
                  <Line yAxisId="right" type="monotone" dataKey="totalSales" stroke="#ff8042" name="Total Sales" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}