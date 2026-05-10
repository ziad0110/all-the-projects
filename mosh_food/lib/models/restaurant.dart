import 'package:flutter/cupertino.dart';

import 'food.dart';

class Restaurant extends ChangeNotifier {
  // list of food menu
  final List<Food> _menu = [
    // burgers
    Food(
        name: 'Classic Cheeseburger',
        description:
        'A juicy beef patty with melted cheddar, lettuce, tomato, and a hint of onion and pickle.',
        imagePath: 'lib/images/burgers/sh1.png',
        price: 8.99,
        category: FoodCategory.burgers,
        availableAddons: [
          Addon(name: 'Extra cheese', price: 0.99,),
          Addon(name: 'Bacon', price: 1.99,),
          Addon(name: 'Avocado', price: 1.99,),
        ] ,
    ),
    Food(
      name: 'BBQ Bacon Burger',
      description:
      'Smoky BBQ sauce, crispy bacon, and onion rings make this beef burger a savory delight.',
      imagePath: 'lib/images/burgers/sh2.png',
      price: 10.99,
      category: FoodCategory.burgers,
      availableAddons: [
        Addon(name: 'Grilled', price: 0.99),
        Addon(name: 'Jalapenos', price: 1.49),
        Addon(name: 'Extra BBQ sauce', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Veggie Burger',
      description:
      'A hearty veggie patty topped with fresh avocado, lettuce, and tomato, savory on a whole.',
      imagePath: 'lib/images/burgers/sh3.png',
      price: 9.49,
      category: FoodCategory.burgers,
      availableAddons: [
        Addon(name: 'Veggie Cheese', price: 0.99),
        Addon(name: 'Grilled Mushrooms', price: 1.49),
        Addon(name: 'Hummus Spread', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Aloha Burger',
      description:
      'A char-grilled chicken breast topped with a slice of grilled pineapple, Swiss cheese,',
      imagePath: 'lib/images/burgers/sh4.png',
      price: 9.49,
      category: FoodCategory.burgers,
      availableAddons: [
        Addon(name: 'Teriyaki Glaze', price: 0.99),
        Addon(name: 'Extra Pineapple', price: 0.99),
        Addon(name: 'Bacon', price: 1.49),
      ] ,
    ),
    Food(
      name: 'Blue Moon Burger',
      description:
      "This burger is a blue cheese lover's dream. It features a succulent ground beef patty, ",
      imagePath: 'lib/images/burgers/sh5.png',
      price: 9.49,
      category: FoodCategory.burgers,
      availableAddons: [
        Addon(name: 'Sauteed Mushrooms', price: 0.99),
        Addon(name: 'Fried Egg', price: 1.49),
        Addon(name: 'Spicy Mayo', price: 0.99),
      ] ,
    ),

    // salad
    Food(
      name: 'Caesar Salad',
      description:
      'Crisp romaine lettuce, parmesan cheese, croutons, and Caesar dressing. ',
      imagePath: 'lib/images/salads/sh1.png',
      price: 7.99,
      category: FoodCategory.salads,
      availableAddons: [
        Addon(name: 'Grilled Chicken', price: 0.99),
        Addon(name: 'Anchovies', price: 1.49),
        Addon(name: 'Extra Parmesan', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Greek Salad',
      description:
      'Tomatoes, cucumbers, red onions, olives, feta cheese with olive oil and herbs.',
      imagePath: 'lib/images/salads/sh2.png',
      price: 8.49,
      category: FoodCategory.salads,
      availableAddons: [
        Addon(name: 'Feta Cheese', price: 0.99),
        Addon(name: 'Kalamata 0lives', price: 1.49),
        Addon(name: 'Grilled Shrimp', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Quinoa Salad',
      description:
      'Quinoa mixed with cucumbers, tomatoes, bell peppers , and a lemon vinaigrette.',
      imagePath: 'lib/images/salads/sh3.png',
      price: 9.99,
      category: FoodCategory.salads,
      availableAddons: [
        Addon(name: 'Avocado', price: 0.99),
        Addon(name: 'Feta Cheese', price: 1.49),
        Addon(name: 'Grilled Chicken', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Asian Sesame Salad',
      description:
      'Delight in the flavors of the East with this sesame-infused salad. It includes mixed',
      imagePath: 'lib/images/salads/sh4.png',
      price: 9.99,
      category: FoodCategory.salads,
      availableAddons: [
        Addon(name: 'Mandarin Oranges', price: 0.99),
        Addon(name: 'Almond Slivers', price: 1.49),
        Addon(name: 'Extra Teriyaki Chicken', price: 1.99),
      ] ,
    ),
    Food(
      name: 'South West Chicken Salad',
      description:
      "This colorful salad combines the zesty flavors of the Southwest, It's loaded with mixed ",
      imagePath: 'lib/images/salads/sh5.png',
      price: 9.99,
      category: FoodCategory.salads,
      availableAddons: [
        Addon(name: 'Sour Cream', price: 0.99),
        Addon(name: 'Pico de Gallo', price: 1.49),
        Addon(name: 'Guacamole', price: 1.99),
      ] ,
    ),

    // sides
    Food(
      name: 'Onion Rings',
      description:
      'Crispy sweet potato fries with a touch off salt.',
      imagePath: 'lib/images/sides/sh1.png',
      price: 4.99,
      category: FoodCategory.sides,
      availableAddons: [
        Addon(name: 'Cheese Sauce', price: 0.99),
        Addon(name: 'Truffle Oil', price: 1.49),
        Addon(name: 'Cajun Spice', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Sweet Potato Fries',
      description:
      'Goiden and crispy onioo rings, perfect for dipping.',
      imagePath: 'lib/images/sides/sh2.png',
      price: 3.99,
      category: FoodCategory.sides,
      availableAddons: [
        Addon(name: 'Ranch Dip', price: 0.99),
        Addon(name: 'Spicy Maya', price: 1.49),
        Addon(name: 'Parmesan Dust', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Garlic Bread',
      description:
      'Warm and toasty garlic bread, topped with melted butter and parsley.',
      imagePath: 'lib/images/sides/sh3.png',
      price: 4.49,
      category: FoodCategory.sides,
      availableAddons: [
        Addon(name: 'Extra Garlic', price: 0.99),
        Addon(name: 'Mozzarella Cheese', price: 1.49),
        Addon(name: 'Marinara Dip', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Loaded Sweet Potato Fries',
      description:
      'Savory sweet potato fries loaded with melted cheese, smoky bacon bits, anda dollop',
      imagePath: 'lib/images/sides/sh4.png',
      price: 4.49,
      category: FoodCategory.sides,
      availableAddons: [
        Addon(name: 'Sour Cream', price: 0.99),
        Addon(name: 'Bacon Bits', price: 1.49),
        Addon(name: 'Green Onions', price: 0.99),
      ] ,
    ),
    Food(
      name: 'Crispy Mac & Cheese Bites',
      description:
      'Golden brown, bite-sized mac and cheese balls, perfect for on-the-go snacking. Served with',
      imagePath: 'lib/images/sides/sh5.png',
      price: 4.49,
      category: FoodCategory.sides,
      availableAddons: [
        Addon(name: 'Bacon Bits', price: 0.99),
        Addon(name: 'Jalapeño Slices', price: 1.49),
        Addon(name: 'Sriracha Drizzle', price: 0.99),
      ] ,
    ),

    // dessert
    Food(
      name: 'Chocolate Brownie',
      description:
      'Rich and fudgy chocolate brownie, with chunks of chocolate.',
      imagePath: 'lib/images/desserts/sh1.png',
      price: 5.99,
      category: FoodCategory.desserts,
      availableAddons: [
        Addon(name: 'Vanilla Ice Cream', price: 0.99),
        Addon(name: 'Hot Fudge', price: 1.49),
        Addon(name: 'Whipped Cream', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Cheesecake',
      description:
      'Creamy cheesecake on a graham cracker crust, with a berry compote.',
      imagePath: 'lib/images/desserts/sh2.png',
      price: 6.99,
      category: FoodCategory.desserts,
      availableAddons: [
        Addon(name: 'Strawberry Topping', price: 0.99),
        Addon(name: 'Blueberry Compote', price: 1.49),
        Addon(name: 'Chocolate Chips', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Apple Pie',
      description:
      'Classic apple pie with a flaky crust and a cinnamon-spiced apple filling.',
      imagePath: 'lib/images/desserts/sh3.png',
      price: 5.49,
      category: FoodCategory.desserts,
      availableAddons: [
        Addon(name: 'Caramel Sauce', price: 0.99),
        Addon(name: 'Vanilla Ice Cream', price: 1.49),
        Addon(name: 'Cinnamon Spice', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Red Velvet Lava Cake',
      description:
      'A delectable red velvet cake with a wa rm, gooey chocolate lava center, served with',
      imagePath: 'lib/images/desserts/sh4.png',
      price: 5.49,
      category: FoodCategory.desserts,
      availableAddons: [
        Addon(name: 'Raspberry Sauce', price: 0.99),
        Addon(name: 'Cream Cheese Icing', price: 1.49),
        Addon(name: 'Chocolate Sprinkles', price: 0.99),
      ] ,
    ),
    Food(
      name: 'desserte',
      description:
      'Creamy cheesecake on a graham cracker crust, with a berry compote.',
      imagePath: 'lib/images/desserts/sh5.png',
      price: 6.99,
      category: FoodCategory.desserts,
      availableAddons: [
        Addon(name: 'Strawberry Topping', price: 0.99),
        Addon(name: 'Blueberry Compote', price: 1.49),
        Addon(name: 'Chocolate Chips', price: 1.99),
      ] ,
    ),

    // drinks
    Food(
      name: 'Lemonade',
      description:
      'Refreshing lemonade made with real lemons and a touch of sweetness.',
      imagePath: 'lib/images/drinks/sh1.png',
      price: 2.99,
      category: FoodCategory.drinks,
      availableAddons: [
        Addon(name: 'Strawberry Flavor', price: 0.99),
        Addon(name: 'Strawberry Flavor', price: 1.49),
        Addon(name: 'Ginger Zest', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Iced Tea',
      description:
      'Chilled iced tea with a hint of lemon, served over ice.',
      imagePath: 'lib/images/drinks/sh2.png',
      price: 2.99,
      category: FoodCategory.drinks,
      availableAddons: [
        Addon(name: 'Peach Flavor', price: 0.99),
        Addon(name: 'Lemon Slices', price: 1.49),
        Addon(name: 'Honey', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Smoothie',
      description:
      'A blend of fresh fruits and yogurt, perfect for a healthy boost.',
      imagePath: 'lib/images/drinks/sh3.png',
      price: 4.99,
      category: FoodCategory.drinks,
      availableAddons: [
        Addon(name: 'Protein Powder', price: 0.99),
        Addon(name: 'ALmond Milk', price: 1.49),
        Addon(name: 'Chía Seeds', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Mojito',
      description:
      'A classic Cuban cocktail with muddled lime and mint, Sweetened with sugar.',
      imagePath: 'lib/images/drinks/sh4.png',
      price: 4.99,
      category: FoodCategory.drinks,
      availableAddons: [
        Addon(name: 'Ext ra Mint', price: 0.49),
        Addon(name: 'Raspberry Puree', price: 0.99),
        Addon(name: 'Splash of Coconut Rum', price: 1.99),
      ] ,
    ),
    Food(
      name: 'Caramel Macchiato',
      description:
      'A layered coffee drink with steamed milk, espresso, and vanilla syrup.',
      imagePath: 'lib/images/drinks/sh5.png',
      price: 4.99,
      category: FoodCategory.drinks,
      availableAddons: [
        Addon(name: 'Extra Shot of Espresso', price: 0.99),
        Addon(name: 'Hazelnut Syrup', price: 0.49),
        Addon(name: 'Whipped Cream', price: 0.99),
      ] ,
    ),
  ];
  // G E T T E R S

  List<Food> get menu => _menu;

  // O P E R A T I O N S

// add to cart

// remove from cart

// get total price of cart

// get total number of items in cart

// clear cart

// H E L P E R S

// generate a receipt

// format doubl value into money

// format list of addons into a string summary
}
