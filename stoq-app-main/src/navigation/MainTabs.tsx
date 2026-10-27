
import React from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
import { theme } from "../theme/styles";

const blue = colors.primary;
const Tab = createBottomTabNavigator();
const HomeNav = createNativeStackNavigator();
const StockNav = createNativeStackNavigator();
const MoreNav = createNativeStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: blue },
  headerTintColor: theme.white,
  headerTitleStyle: {
    fontWeight: "900" as const,
    fontSize: 18,
  },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: theme.background },
};

const scannerOptions = {
  title: "Scan Barcode",
  headerShown: false,
};

function HomeStack() {
  return (
    <HomeNav.Navigator screenOptions={headerOptions}>
      <HomeNav.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "STOQ" }}
      />
      <HomeNav.Screen
        name="LogSale"
        component={LogSaleScreen}
        options={{ title: "Log a Sale" }}
      />
      <HomeNav.Screen
        name="Restock"
        component={RestockScreen}
        options={{ title: "Record Restock" }}
      />
      <HomeNav.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ title: "Stockout Alerts" }}
      />
      <HomeNav.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={scannerOptions}
      />
    </HomeNav.Navigator>
  );
}

function StockStack() {
  return (
    <StockNav.Navigator screenOptions={headerOptions}>
      <StockNav.Screen
        name="StockList"
        component={StockListScreen}
        options={{ title: "Stock Items" }}
      />
      <StockNav.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={{ title: "Product" }}
      />
      <StockNav.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={scannerOptions}
      />
    </StockNav.Navigator>
  );
}

function MoreStack() {
  return (
    <MoreNav.Navigator screenOptions={headerOptions}>
      <MoreNav.Screen
        name="More"
        component={MoreScreen}
        options={{ title: "More" }}
      />
      <MoreNav.Screen
        name="Suppliers"
        component={SupplierListScreen}
        options={{ title: "Suppliers" }}
      />
      <MoreNav.Screen
        name="SupplierForm"
        component={SupplierFormScreen}
        options={{ title: "Supplier" }}
      />
      <MoreNav.Screen
        name="StaffManagement"
        component={StaffManagementScreen}
        options={{ title: "Manage Staff" }}
      />
      <MoreNav.Screen
        name="StaffForm"
        component={StaffFormScreen}
        options={{ title: "Add Staff" }}
      />
    </MoreNav.Navigator>
  );
}

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({
  focused,
  active,
  inactive,
}: {
  focused: boolean;
  active: IconName;
  inactive: IconName;
}) {
  return (
    <View
      style={[
        styles.icon,
        focused && {
          backgroundColor: blue,
          borderColor: theme.black,
        },
      ]}
    >
      <Ionicons
        name={focused ? active : inactive}
        size={23}
        color={focused ? theme.white : theme.black}
      />
    </View>
  );
}

const tabs: {
  name: string;
  title: string;
  component: React.ComponentType<any>;
  active: IconName;
  inactive: IconName;
}[] = [
  {
    name: "HomeTab",
    title: "Home",
    component: HomeStack,
    active: "home",
    inactive: "home-outline",
  },
  {
    name: "StockTab",
    title: "Stock",
    component: StockStack,
    active: "cube",
    inactive: "cube-outline",
  },
  {
    name: "ReportsTab",
    title: "Reports",
    component: SalesReportScreen,
    active: "bar-chart",
    inactive: "bar-chart-outline",
  },
  {
    name: "MoreTab",
    title: "More",
    component: MoreStack,
    active: "settings",
    inactive: "settings-outline",
  },
];

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: blue,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: styles.label,
        tabBarStyle: {
          ...styles.tabBar,
          height: 69 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 7),
        },
        tabBarItemStyle: { paddingVertical: 2 },
      }}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                active={tab.active}
                inactive={tab.inactive}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 47,
    height: 36,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "900",
    marginTop: 2,
  },
  tabBar: {
    backgroundColor: theme.background,
    borderTopWidth: 2.5,
    borderTopColor: blue,
    paddingTop: 7,
    elevation: 0,
    shadowOpacity: 0,
  },
});
