import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (date: Date | string | any): string => {
    try {
      let dateObj: Date;
      
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date && typeof date === 'object' && date.toDate) {
        // Firebase Timestamp
        dateObj = date.toDate();
      } else if (date && typeof date === 'object' && date.seconds) {
        // Firebase Timestamp object
        dateObj = new Date(date.seconds * 1000);
      } else {
        dateObj = new Date(date);
      }
      
      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) {
        return 'recientemente';
      }
      
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'recientemente';
    }
  };

  const handleLogout = async () => {
    console.log('🚪 Botón de logout presionado');
    
    if (Platform.OS === 'web') {
      // En web usar nuestro modal personalizado
      setShowLogoutModal(true);
    } else {
      // En móvil usar Alert.alert
      Alert.alert(
        'Cerrar Sesión',
        '¿Estás seguro de que quieres cerrar sesión?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Cerrar Sesión',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('🚪 Iniciando logout desde ProfileScreen...');
                await logout();
                console.log('✅ Logout completado desde ProfileScreen');
              } catch (error) {
                console.error('❌ Error en logout desde ProfileScreen:', error);
                Alert.alert('Error', 'No se pudo cerrar sesión');
              }
            },
          },
        ]
      );
    }
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      console.log('🚪 Iniciando logout desde ProfileScreen...');
      await logout();
      console.log('✅ Logout completado desde ProfileScreen');
    } catch (error) {
      console.error('❌ Error en logout desde ProfileScreen:', error);
      // En web usar alert nativo para errores
      alert('Error: No se pudo cerrar sesión');
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleHelp = () => {
    setShowHelpModal(true);
  };

  const handleAbout = () => {
    setShowAboutModal(true);
  };

  const closeHelpModal = () => {
    setShowHelpModal(false);
  };

  const closeAboutModal = () => {
    setShowAboutModal(false);
  };

  const handleEditProfile = () => {
    setEditUsername(user?.username || '');
    setEditEmail(user?.email || '');
    setEditPassword('');
    setShowPassword(false);
    setShowEditProfileModal(true);
  };

  const closeEditProfileModal = () => {
    setShowEditProfileModal(false);
    setEditUsername('');
    setEditEmail('');
    setEditPassword('');
    setShowPassword(false);
  };

  const handleUpdateProfile = async () => {
    if (!editUsername.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (!editEmail.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (editPassword && editPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsUpdating(true);
    try {
      // Aquí iría la lógica para actualizar el perfil en Firebase
      // Por ahora solo simulamos la actualización
      console.log('Actualizando perfil:', { 
        username: editUsername, 
        email: editEmail, 
        password: editPassword ? '***' : 'no change' 
      });
      
      // Simular delay de actualización
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      closeEditProfileModal();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Mi Perfil</Text>
      <Text style={styles.subtitle}>Gestiona tu cuenta</Text>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="person" size={60} color="#667eea" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradientBackground}
      >
        {renderHeader()}
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color="#fff" />
          </View>
          <Text style={styles.name}>{user.username || 'Usuario'}</Text>
          <Text style={styles.email}>{user.email || 'usuario@ejemplo.com'}</Text>
          <Text style={styles.memberSince}>
            Miembro desde {user.createdAt ? formatDate(user.createdAt) : 'recientemente'}
          </Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={24} color="#667eea" />
            <Text style={styles.menuText}>Editar Perfil</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
            <Ionicons name="help-circle-outline" size={24} color="#667eea" />
            <Text style={styles.menuText}>Ayuda</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
            <Ionicons name="information-circle-outline" size={24} color="#667eea" />
            <Text style={styles.menuText}>Acerca de</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmación personalizado para web */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Cerrar Sesión"
        message="¿Estás seguro de que quieres cerrar sesión? Esta acción te desconectará de la aplicación."
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        type="danger"
      />

      {/* Modal de Ayuda */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="slide"
        onRequestClose={closeHelpModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ayuda</Text>
              <TouchableOpacity onPress={closeHelpModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>🎵 Buscar Rimas</Text>
                <Text style={styles.helpText}>
                  • Escribe una palabra en el campo de búsqueda{'\n'}
                  • Presiona el botón de búsqueda o Enter{'\n'}
                  • Encuentra rimas perfectas y aproximadas{'\n'}
                  • Marca tus favoritas con el corazón
                </Text>
              </View>
              
              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>❤️ Favoritos</Text>
                <Text style={styles.helpText}>
                  • Guarda las rimas que más te gusten{'\n'}
                  • Accede a ellas desde la pestaña Favoritos{'\n'}
                  • Elimina favoritos con el botón de basura{'\n'}
                  • Sincroniza entre dispositivos
                </Text>
              </View>
              
              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>📝 Notas</Text>
                <Text style={styles.helpText}>
                  • Crea poemas y composiciones{'\n'}
                  • Guarda tus ideas creativas{'\n'}
                  • Marca notas como favoritas{'\n'}
                  • Copia contenido al portapapeles
                </Text>
              </View>
              
              <View style={styles.helpSection}>
                <Text style={styles.helpSectionTitle}>💡 Consejos</Text>
                <Text style={styles.helpText}>
                  • Usa palabras en español para mejores resultados{'\n'}
                  • Experimenta con diferentes palabras{'\n'}
                  • Guarda tus mejores rimas en favoritos{'\n'}
                  • Crea notas para desarrollar tus poemas
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Acerca de */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="slide"
        onRequestClose={closeAboutModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Acerca de</Text>
              <TouchableOpacity onPress={closeAboutModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <View style={styles.aboutSection}>
                <View style={styles.appLogo}>
                  <Ionicons name="musical-notes" size={60} color="#667eea" />
                </View>
                <Text style={styles.appName}>RhymeFinder</Text>
                <Text style={styles.appVersion}>Versión 1.0.0</Text>
              </View>
              
              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>🎯 Descripción</Text>
                <Text style={styles.aboutText}>
                  RhymeFinder es tu compañero perfecto para encontrar rimas en español. 
                  Diseñada para poetas, compositores y amantes de la literatura, 
                  esta aplicación te ayuda a descubrir las palabras que necesitas 
                  para crear versos memorables.
                </Text>
              </View>
              
              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>✨ Características</Text>
                <Text style={styles.aboutText}>
                  • Búsqueda de rimas en español{'\n'}
                  • Sistema de favoritos{'\n'}
                  • Notas para composiciones{'\n'}
                  • Interfaz intuitiva y moderna{'\n'}
                  • Sincronización en la nube{'\n'}
                  • Funciona offline
                </Text>
              </View>
              
              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>🔧 Tecnologías</Text>
                <Text style={styles.aboutText}>
                  • React Native & Expo{'\n'}
                  • Firebase (Autenticación y Base de datos){'\n'}
                  • RhymeBrain API{'\n'}
                  • TypeScript{'\n'}
                  • AsyncStorage
                </Text>
              </View>
              
              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>👨‍💻 Desarrollo</Text>
                <Text style={styles.aboutText}>
                  Desarrollado como proyecto académico para la materia de 
                  Aplicaciones Móviles en la Universidad Privada Domingo Savio.
                </Text>
              </View>
            </ScrollView>
          </View>
                 </View>
       </Modal>

       {/* Modal de Editar Perfil */}
       <Modal
         visible={showEditProfileModal}
         transparent
         animationType="slide"
         onRequestClose={closeEditProfileModal}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContainer}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Editar Perfil</Text>
               <TouchableOpacity onPress={closeEditProfileModal} style={styles.closeButton}>
                 <Ionicons name="close" size={24} color="#666" />
               </TouchableOpacity>
             </View>
             
             <ScrollView style={styles.modalContent}>
               <View style={styles.formSection}>
                 <Text style={styles.formLabel}>Nombre de Usuario</Text>
                 <View style={styles.inputContainer}>
                   <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
                   <TextInput
                     style={styles.textInput}
                     placeholder="Tu nombre de usuario"
                     value={editUsername}
                     onChangeText={setEditUsername}
                     autoCapitalize="words"
                     autoCorrect={false}
                   />
                 </View>
               </View>

               <View style={styles.formSection}>
                 <Text style={styles.formLabel}>Correo Electrónico</Text>
                 <View style={styles.inputContainer}>
                   <Ionicons name="mail-outline" size={20} color="#667eea" style={styles.inputIcon} />
                   <TextInput
                     style={styles.textInput}
                     placeholder="tu@email.com"
                     value={editEmail}
                     onChangeText={setEditEmail}
                     keyboardType="email-address"
                     autoCapitalize="none"
                     autoCorrect={false}
                   />
                 </View>
               </View>

               <View style={styles.formSection}>
                 <Text style={styles.formLabel}>Nueva Contraseña (opcional)</Text>
                 <View style={styles.inputContainer}>
                   <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                   <TextInput
                     style={styles.textInput}
                     placeholder="Deja vacío para mantener la actual"
                     value={editPassword}
                     onChangeText={setEditPassword}
                     secureTextEntry={!showPassword}
                     autoCapitalize="none"
                     autoCorrect={false}
                   />
                   <TouchableOpacity
                     onPress={() => setShowPassword(!showPassword)}
                     style={styles.passwordToggle}
                   >
                     <Ionicons
                       name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                       size={20}
                       color="#667eea"
                     />
                   </TouchableOpacity>
                 </View>
                 <Text style={styles.formNote}>
                   Mínimo 6 caracteres. Deja vacío para mantener la contraseña actual.
                 </Text>
               </View>

               <View style={styles.formSection}>
                 <Text style={styles.formLabel}>Miembro desde</Text>
                 <View style={styles.infoContainer}>
                   <Ionicons name="calendar-outline" size={20} color="#667eea" style={styles.inputIcon} />
                   <Text style={styles.infoText}>
                     {user?.createdAt ? formatDate(user.createdAt) : 'recientemente'}
                   </Text>
                 </View>
                 <Text style={styles.formNote}>
                   La fecha de registro no se puede modificar
                 </Text>
               </View>

               <View style={styles.buttonContainer}>
                 <TouchableOpacity
                   style={styles.cancelButton}
                   onPress={closeEditProfileModal}
                   disabled={isUpdating}
                 >
                   <Text style={styles.cancelButtonText}>Cancelar</Text>
                 </TouchableOpacity>

                 <TouchableOpacity
                   style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
                   onPress={handleUpdateProfile}
                   disabled={isUpdating}
                 >
                   {isUpdating ? (
                     <ActivityIndicator size="small" color="#fff" />
                   ) : (
                     <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                   )}
                 </TouchableOpacity>
               </View>
             </ScrollView>
           </View>
         </View>
       </Modal>
     </SafeAreaView>
   );
 };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  gradientBackground: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e74c3c',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
    marginLeft: 8,
  },
  // Estilos para modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: Platform.OS === 'web' ? '80%' : '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'web' ? 20 : 40,
  },
  helpSection: {
    marginBottom: 24,
  },
  helpSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  aboutSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  appLogo: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  aboutSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'left',
  },
  // Estilos para el formulario de edición
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  formNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  passwordToggle: {
    padding: 4,
  },
});
