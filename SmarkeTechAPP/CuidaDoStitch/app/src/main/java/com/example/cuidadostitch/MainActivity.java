package com.example.cuidadostitch;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import java.util.Set;

public class MainActivity extends AppCompatActivity implements BluetoothConnectionService.MessageCallback {

    private TextView item1Quantity, item2Quantity, item3Quantity;
    private int[] quantities = new int[3];
    private double[] prices = {5.99, 7.50, 4.25};
    private String[] itemNames = {"Maçã", "Banana", "Laranja"};

    private BluetoothConnectionService bluetoothConnectionService;
    private Handler handler;
    private static final String ESP32_MAC_ADDRESS = "34:5F:45:AA:B2:0A";

    // Códigos de solicitação de permissão
    private static final int REQUEST_ENABLE_BT = 1;
    private static final int REQUEST_BLUETOOTH_PERMISSIONS = 2;
    private static final int REQUEST_CART_ACTIVITY = 100;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        handler = new Handler();
        setupUI();

        // Verificar e solicitar permissões
        checkBluetoothPermissions();
    }

    private void checkBluetoothPermissions() {
        // Lista de permissões necessárias
        String[] permissions = {
                Manifest.permission.BLUETOOTH,
                Manifest.permission.BLUETOOTH_ADMIN,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.ACCESS_FINE_LOCATION
        };

        boolean allPermissionsGranted = true;
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                allPermissionsGranted = false;
                break;
            }
        }

        if (allPermissionsGranted) {
            // Todas as permissões concedidas, configurar Bluetooth
            setupBluetooth();
        } else {
            // Solicitar permissões
            ActivityCompat.requestPermissions(this, permissions, REQUEST_BLUETOOTH_PERMISSIONS);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == REQUEST_BLUETOOTH_PERMISSIONS) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }

            if (allGranted) {
                setupBluetooth();
            } else {
                Toast.makeText(this, "Permissões de Bluetooth são necessárias", Toast.LENGTH_LONG).show();
            }
        }
    }

    private void setupBluetooth() {
        bluetoothConnectionService = new BluetoothConnectionService(this, handler, this);

        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (bluetoothAdapter == null) {
            Toast.makeText(this, "Dispositivo não suporta Bluetooth", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!bluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
        } else {
            connectToESP32();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == REQUEST_ENABLE_BT) {
            if (resultCode == RESULT_OK) {
                connectToESP32();
            } else {
                Toast.makeText(this, "Bluetooth não foi ativado", Toast.LENGTH_SHORT).show();
            }
        } else if (requestCode == REQUEST_CART_ACTIVITY) {
            if (resultCode == RESULT_OK && data != null) {
                boolean shouldSendCommand = data.getBooleanExtra("shouldSendCommand", false);
                if (shouldSendCommand) {
                    quantities = data.getIntArrayExtra("quantities");
                    sendOrderToESP32();

                    // Ir para tela de preparação
                    Intent intent = new Intent(this, PreparingOrderActivity.class);
                    intent.putExtra("quantities", quantities);
                    intent.putExtra("totalItems", quantities[0] + quantities[1] + quantities[2]);
                    startActivity(intent);
                }
            }
        }
    }

    private void connectToESP32() {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();

        if (bluetoothAdapter == null) {
            Toast.makeText(this, "Bluetooth não disponível", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!bluetoothAdapter.isEnabled()) {
            Toast.makeText(this, "Por favor, ative o Bluetooth", Toast.LENGTH_SHORT).show();
            return;
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "Permissão Bluetooth necessária", Toast.LENGTH_SHORT).show();
            return;
        }

        Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();

        if (pairedDevices.size() > 0) {
            for (BluetoothDevice device : pairedDevices) {
                if (device.getAddress().equals(ESP32_MAC_ADDRESS)) {
                    bluetoothConnectionService.connect(device);
                    return;
                }
            }
        }

        Toast.makeText(this, "ESP32 não pareada. Pareie o dispositivo primeiro.", Toast.LENGTH_LONG).show();
    }

    private void setupUI() {
        item1Quantity = findViewById(R.id.item1_quantity);
        item2Quantity = findViewById(R.id.item2_quantity);
        item3Quantity = findViewById(R.id.item3_quantity);

        Button btnCart = findViewById(R.id.btn_cart);
        btnCart.setOnClickListener(v -> openCart());

        setupQuantityButtons(R.id.item1_add, R.id.item1_remove, 0, item1Quantity);
        setupQuantityButtons(R.id.item2_add, R.id.item2_remove, 1, item2Quantity);
        setupQuantityButtons(R.id.item3_add, R.id.item3_remove, 2, item3Quantity);
    }

    private void setupQuantityButtons(int addButtonId, int removeButtonId, int itemIndex, TextView quantityView) {
        Button addButton = findViewById(addButtonId);
        Button removeButton = findViewById(removeButtonId);

        addButton.setOnClickListener(v -> {
            quantities[itemIndex]++;
            quantityView.setText(String.valueOf(quantities[itemIndex]));
        });

        removeButton.setOnClickListener(v -> {
            if (quantities[itemIndex] > 0) {
                quantities[itemIndex]--;
                quantityView.setText(String.valueOf(quantities[itemIndex]));
            }
        });
    }

    private void openCart() {
        Intent intent = new Intent(this, CartActivity.class);
        intent.putExtra("quantities", quantities);
        intent.putExtra("prices", prices);
        intent.putExtra("itemNames", itemNames);
        startActivityForResult(intent, REQUEST_CART_ACTIVITY);
    }

    @Override
    public void onMessageReceived(String message) {
        if (message != null && message.startsWith("ULTRASONIC:")) {
            try {
                String cleanMessage = message.substring(11).trim();
                int detectedItems = Integer.parseInt(cleanMessage);
                int totalItems = quantities[0] + quantities[1] + quantities[2];

                if (detectedItems >= totalItems) {
                    runOnUiThread(() -> {
                        Intent intent = new Intent(this, OrderReadyActivity.class);
                        startActivity(intent);
                    });
                }
            } catch (NumberFormatException e) {
                Log.e("BLUETOOTH", "Mensagem inválida: " + message);
            }
        }
    }

    @Override
    public void onConnectionStatusChanged(boolean connected) {
        runOnUiThread(() -> {
            if (connected) {
                Toast.makeText(this, "Conectado à ESP32", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "Desconectado da ESP32", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onError(String errorMessage) {
        runOnUiThread(() -> {
            Toast.makeText(this, errorMessage, Toast.LENGTH_LONG).show();
        });
    }

    public void sendOrderToESP32() {
        int totalItems = quantities[0] + quantities[1] + quantities[2];
        if (totalItems == 0) {
            Toast.makeText(this, "Nenhum item selecionado", Toast.LENGTH_SHORT).show();
            return;
        }

        StringBuilder command = new StringBuilder();
        for (int i = 0; i < quantities.length; i++) {
            if (quantities[i] > 0) {
                command.append("SERVO").append(i + 1).append(":").append(quantities[i]).append(";");
                Log.d("SERVO_DEBUG", "Servo " + (i+1) + ": " + quantities[i] + " rotações");
            }
        }
        command.append("MOTORS:10;");

        String finalCommand = command.toString();
        Log.d("BLUETOOTH", "Comando completo: " + finalCommand);

        if (bluetoothConnectionService != null && bluetoothConnectionService.isConnected()) {
            bluetoothConnectionService.write(finalCommand);
            Toast.makeText(this, "Comando enviado: " + finalCommand, Toast.LENGTH_LONG).show();
            Log.d("BLUETOOTH", "Comando enviado com sucesso");
        } else {
            Toast.makeText(this, "ERRO: Bluetooth não conectado", Toast.LENGTH_LONG).show();
            Log.e("BLUETOOTH", "Falha ao enviar - Bluetooth desconectado");
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (bluetoothConnectionService != null) {
            bluetoothConnectionService.stop();
        }
    }
}