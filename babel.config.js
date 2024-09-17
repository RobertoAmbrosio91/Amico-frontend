// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ["babel-preset-expo", "module:metro-react-native-babel-preset"],
//     plugins: [

//       //"expo-router/babel",
//        "react-native-reanimated/plugin",
//       [
//         "module-resolver",
//         {
//           root: ["./src"],
//           alias: {
//             "@": "./src",
        
//           },
//         },
//       ],
//     ],
//   };
// };
   module.exports = function (api) {
     api.cache(true);

     const presets = ["babel-preset-expo"];
     //  const plugins = ["react-native-reanimated/plugin"];
     //  const plugins = [
     //    [
     //      "module:react-native-dotenv",
     //      {
     //        moduleName: "@env",
     //        path: ".env",
     //      },
     //    ],
     //  ];

     return {
       presets,
        //  plugins,
     };
   };
