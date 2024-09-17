import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Linking, 
    TextInput } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as SMS from 'expo-sms';
import Header from '@/components/header/header';
import typography from 'src/config/typography';
import colors from 'src/config/colors';
import CustomButton from '@/components/buttons&inputs/CustomButton';
import { router } from 'expo-router';

interface Contact {
  id: string; // Assuming there's an ID field to uniquely identify each contact
  name: string;
  phoneNumbers?: { number: string; label: string }[];
}

const InviteFriends = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]); // Store selected contact IDs
  const [searchQuery, setSearchQuery] = useState('');
  const isDisabled = selectedContacts.length > 0 ? false : true;


  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          setContacts(data as Contact[]);
        }
      }
    })();
  }, []);

  const toggleContactSelection = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name && contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  const sendLink = async () => {
    const selectedPhoneNumbers = contacts
      .filter(contact => selectedContacts.includes(contact.id))
      .map(contact => contact.phoneNumbers?.[0].number)
      .filter(number => number) as string[];

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable && selectedPhoneNumbers.length > 0) {
      const { result } = await SMS.sendSMSAsync(selectedPhoneNumbers, "Here's a link to my app: www.noosk.co");

      // Check if the SMS was sent successfully, and navigate
      if (result === 'sent' || result === 'unknown') {
        // Adjust based on the API response you expect
        router.replace("/myeventsrevisited"); // Navigate to the Thank You screen
      }
    } else {
      Alert.alert('SMS is not available or no contacts selected');
    }
  };

  const renderSelectedContacts = () => {
    return selectedContacts.map(contactId => {
      const contact = contacts.find(c => c.id === contactId);
      return (
        <View key={contactId} style={styles.selectedContactItem}>
          <Text style={styles.selectedContactText}>{contact?.name}</Text>
          <TouchableOpacity onPress={() => toggleContactSelection(contactId)}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      );
    });
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
        <Header/>
        <Text style={styles.title}>Invite your friends</Text>
        <Text style={styles.subTitle}>Bring your close friends aboard our platform to share and create lasting memories as a group</Text>
        <TextInput
            style={styles.searchInput}
            placeholder="Search Contacts..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        <View style={styles.selectedContactsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderSelectedContacts()}
        </ScrollView>
      </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {filteredContacts.map((contact, index) => (
            <TouchableOpacity
              key={contact.id}
              style={[
                styles.contactItem,
                selectedContacts.includes(contact.id) && styles.contactItemSelected,
              ]}
              onPress={() => toggleContactSelection(contact.id)}>
              <Text style={styles.contactText}>
                {contact.name}
              </Text>
            </TouchableOpacity>
          ))}

      </ScrollView>
      
      <CustomButton
              text={"Send Link"}
              textStyle={{
                fontFamily: typography.appFont[700],
              }}
              borderStyle={{
                backgroundColor: isDisabled
                  ? colors.__disabled_button
                  : colors.primary_contrast,
                borderRadius: 4,
              }}
              onPress={sendLink}
              disabled={isDisabled}
            />
          </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.__main_color, // Assuming this is a dark color
  },
  scrollView: {
    marginBottom: 20,
    width: "100%",
  },
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  title: {
    fontFamily: typography.appFont[700],
    color: colors.w_contrast, // Ensure this color contrasts well with the new background
    fontSize: 30,
    marginTop: 20,
    marginBottom: 10,
    width: "100%",
  },
  subTitle: {
    fontFamily: typography.appFont[400],
    fontSize: 16,
    marginTop: 0,
    color: colors.__blue_dark, // Adjust if necessary to ensure readability
    width: "100%",
  },
  contactItem: {
    flexDirection: 'row',
    backgroundColor: colors.tertiary_contrast, // Adjusted for better contrast with new background
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    alignItems: 'center',
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowColor: '#000', // Adjusted for better visibility on new background
    shadowOffset: { width: 0, height: 2 },
  },
  contactItemSelected: {
    backgroundColor: colors.primary_contrast, // Adjusted for visible selection on new background
  },
  contactText: {
    fontSize: 16,
    color: '#fff', // White text for better readability
  },
  sendButton: {
    backgroundColor: '#2a2a2b', // Adjusted to complement the new background
    padding: 15,
    marginTop: 20,
    borderRadius: 5,
    width: "100%",
  },
  sendButtonText: {
    color: '#fff', // White text for better readability
    fontSize: 16,
    alignSelf: "center",
  },
  searchInput: {
    backgroundColor: '#fff', // Adjusted for visibility
    color: '#000', // White text for readability
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    width: '100%',
  },
  selectedContactsContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fff', // Adjusted for visibility
  },
  selectedContactItem: {
    backgroundColor: '#555', // Adjusted for visibility and contrast
    borderRadius: 15,
    padding: 10,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedContactText: {
    color: '#fff', // White text for readability
    marginRight: 10,
  },
  removeButtonText: {
    color: '#f44', // Adjusted for visibility and aesthetic
    fontWeight: 'bold',
  },
});

export default InviteFriends;

