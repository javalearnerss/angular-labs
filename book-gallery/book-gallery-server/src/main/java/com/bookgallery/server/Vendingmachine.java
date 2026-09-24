package com.bookgallery.server;

import lombok.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

public class Vendingmachine {

    public static void main(String[] args) {

        List<Product> items = List.of(
                new Product("Coke", 40.0, 10),
                new Product("Pepsi", 40.0, 8),
                new Product("Lays", 30.0, 15),
                new Product("Dairy Milk", 50.0, 12),
                new Product("Water", 20.0, 20)
        );

        VendingMachine vendingMachine = new VendingMachine(items);

        vendingMachine.displayItems();
        vendingMachine.addItemToCart(items.getFirst());
        vendingMachine.addItemToCart(items.getFirst());
        vendingMachine.addItemToCart(items.getFirst());

        vendingMachine.addItemToCart(items.getLast());
        vendingMachine.addItemToCart(items.getLast());

        vendingMachine.pay();

    }


    private static class VendingMachine {
        private List<Product> items;
        private List<Product> cart = new ArrayList<>();

        public VendingMachine(List<Product> items) {
            this.items = items;
        }

        public void displayItems() {
            items.forEach(item -> {
                System.out.println("Item Name : " + item.getName() + " Quantity : " + item.getQuantity());
            });
        }

        public void addItemToCart(Product item) {
            Optional<Product> addedItem = cart.stream().filter(cartItem -> item.getName().equalsIgnoreCase(cartItem.getName())).findAny();

            if (addedItem.isPresent()) {
                addedItem.get().setQuantity(addedItem.get().getQuantity() + 1);

            } else {
                cart.add(new Product(item.getName(), item.getPrice(), 1));
            }

            System.out.println(addedItem);
            System.out.println("Item added to cart : Item - " + item.name + ", price - " + item.price);
            calculateTotalAmount();
        }


        private void calculateTotalAmount() {
            double total = cart.stream().mapToDouble(item -> item.getPrice() * item.getQuantity()).sum();
            System.out.println(" Cart total : " + total);
        }

        public void pay() {
            System.out.println("Payment is successful");
            cart.forEach(cartItem -> {
                Optional<Product> stockItemCountToBeUpdated = items.stream().filter(stockItem -> stockItem.name.equalsIgnoreCase(cartItem.name)).findFirst();
                stockItemCountToBeUpdated.ifPresent(sItem -> sItem.setQuantity(sItem.quantity - cartItem.quantity));
            });
        }
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @ToString
    private static class Product {
        private int id;
        private String name;
        private BigDecimal price;

        public Product(String name) {
            this.name = name;
        }

        @Override
        public boolean equals(Object o) {
            if (o == null || getClass() != o.getClass()) return false;
            Product product = (Product) o;
            return Objects.equals(name, product.name);
        }

        @Override
        public int hashCode() {
            return Objects.hash(name, price);
        }

    }


    private static class Inventory {

        Map<Integer, Integer> products;

        public Inventory(Map<Integer, Integer> products) {
            this.products = products;
        }

        public void addProduct(Product product, int quantity) {
            products.merge(product.getId(), quantity, Integer::sum);
        }

        public void removeProduct(Product product, int quantity) {
            if (!isAvailable(product, quantity)) {
                throw new IllegalArgumentException("Product is not available");
            }
            products.compute(product.getId(), (key, current) -> current - quantity);
        }

        public boolean isAvailable(Product product, int quantity) {
            return products.getOrDefault(product.getId(), 0) >= quantity;
        }

        public Integer getQuantity(Product product) {
            return products.get(product.getId());
        }
    }

    @Getter
    @Setter
    @ToString
    @AllArgsConstructor
    @NoArgsConstructor
    private static class CartItem {
        private Product product;
        private int qty;

        public void increaseQty() {
            qty++;
        }

        public BigDecimal getTotal() {
            return product.getPrice().multiply(BigDecimal.valueOf(qty));
        }

    }

    @Getter
    private static class Cart {
        Map<Integer, CartItem> cartItems;

        public Cart() {
            cartItems = new HashMap<>();
        }

        public void add(Product product) {
            CartItem cartItem = cartItems.get(product.getId());
            if (cartItem == null) {
                cartItems.put(product.getId(), new CartItem(product, 1));
            } else {
                cartItem.increaseQty();
            }
        }

        public double getCartTotalAmount() {
            return cartItems.values().stream().mapToDouble(item -> item.getTotal().doubleValue()).sum();
        }

    }

    private static class Payment {

        public Payment() {

        }

        public void pay(Cart cart) {
            System.out.println("Total amount to be collected : " + cart.calculateTotalAmount());
        }
    }


}
