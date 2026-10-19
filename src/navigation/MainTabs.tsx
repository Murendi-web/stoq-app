import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import DashboardScreen from "../screens/dashboard/DashboardScreen";
import StockListScreen from "../screens/stock/StockListScreen";
import ProductFormScreen from "../screens/stock/ProductFormScreen";
import RestockScreen from "../screens/stock/RestockScreen";
import BarcodeScannerScreen from "../screens/stock/BarcodeScannerScreen";
import LogSaleScreen from "../screens/sales/LogSaleScreen";
import SalesReportScreen from "../screens/sales/SalesReportScreen";
import AlertsScreen from "../screens/alerts/AlertsScreen";
import SupplierListScreen from "../screens/suppliers/SupplierListScreen";
import SupplierFormScreen from "../screens/suppliers/SupplierFormScreen";
import MoreScreen from "../screens/settings/MoreScreen";
import StaffManagementScreen from "../screens/settings/StaffManagementScreen";
import StaffFormScreen from "../screens/settings/StaffFormScreen";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator();
const HomeStackNav = createNativeStackNavigator();
const StockStackNav = createNativeStackNavigator();
const MoreStackNav = createNativeStackNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "700" as const },
};

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={headerStyle}>
      <HomeStackNav.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Stoq" }} />
      <HomeStackNav.Screen name="LogSale" component={LogSaleScreen} options={{ title: "Log a Sale" }} />
      <HomeStackNav.Screen name="Restock" component={RestockScreen} options={{ title: "Record Restock" }} />
      <HomeStackNav.Screen name="Alerts" component={AlertsScreen} options={{ title: "Stockout Alerts" }} />
      <HomeStackNav.Screen name="BarcodeScanner" component={BarcodeScannerScreen} options={{ title: "Scan Barcode" }} />
    </HomeStackNav.Navigator>
  );
}

function StockStack() {
  return (
    <StockStackNav.Navigator screenOptions={headerStyle}>
      <StockStackNav.Screen name="StockList" component={StockListScreen} options={{ title: "Stock Items" }} />
      <StockStackNav.Screen name="ProductForm" component={ProductFormScreen} options={{ title: "Product" }} />
      <StockStackNav.Screen name="BarcodeScanner" component={BarcodeScannerScreen} options={{ title: "Scan Barcode" }} />
    </StockStackNav.Navigator>
  );
}

function MoreStack() {
  return (
    <MoreStackNav.Navigator screenOptions={headerStyle}>
      <MoreStackNav.Screen name="More" component={MoreScreen} options={{ title: "More" }} />
      <MoreStackNav.Screen name="Suppliers" component={SupplierListScreen} options={{ title: "Suppliers" }} />
      <MoreStackNav.Screen name="SupplierForm" component={SupplierFormScreen} options={{ title: "Supplier" }} />
      <MoreStackNav.Screen name="StaffManagement" component={StaffManagementScreen} options={{ title: "Manage Staff" }} />
      <MoreStackNav.Screen name="StaffForm" component={StaffFormScreen} options={{ title: "Add Staff" }} />
    </MoreStackNav.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="StockTab"
        component={StockStack}
        options={{
          title: "Stock",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "cube" : "cube-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={SalesReportScreen}
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStack}
        options={{
          title: "More",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}