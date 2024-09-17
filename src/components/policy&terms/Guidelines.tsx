import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
 
const Guidelines: React.FC = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Amico Community Guidelines</Text>
        <Text style={styles.subHeader}>The Short</Text>
        <Text style={styles.paragraph}>
          We want Amico to be an authentic and safe place for people to share
          genuine content from their social experiences. Help us foster this
          community. Post only your videos and pictures and always follow the
          law. Respect everyone on Amico, don’t post nudity. Be respectful and
          encouraging to others, cultivate friendships and enjoy the content
          shared by others.
        </Text>

        <Text style={styles.subHeader}>The Long</Text>
        <Text style={styles.paragraph}>
          Amico is designed as a vibrant space for individuals looking to share
          and celebrate social moments with family, friends, acquaintances and
          whomever else they feel like. Commitment to maintaining a safe and
          serene community remains paramount, ensuring a welcoming experience
          for all.
        </Text>

        <Text style={styles.paragraph}>
          We created these Community Guidelines so users can help us foster and
          protect our community. By using Amico, you agree to these guidelines
          and to our Terms of Use. We are committed to these guidelines, and we
          hope you are too. Overstepping these boundaries may result in deleted
          content, disabled accounts, or other restrictions.
        </Text>

        <Text style={styles.paragraph}>Thank you for helping us,</Text>
        <Text style={styles.paragraph}>The Amico Team</Text>
      </View>
    );
    };
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 10,
      },
      header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      subHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 15,
      },
      paragraph: {
        fontSize: 14,
        marginTop: 10,
      },
    });
    
    export default Guidelines;