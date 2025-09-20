package com.example.smarketechapp;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.os.Handler;
import android.util.Log;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.UUID;

public class BluetoothConnectionService {
    private static final String TAG = "BluetoothConnectionService";
    private static final UUID MY_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

    private final BluetoothAdapter bluetoothAdapter;
    private Context context;
    private Handler handler;

    private ConnectThread connectThread;
    private ConnectedThread connectedThread;

    private static final int STATE_NONE = 0;
    private static final int STATE_CONNECTING = 1;
    private static final int STATE_CONNECTED = 2;

    private int state;

    public interface MessageCallback {
        void onMessageReceived(String message);
        void onConnectionStatusChanged(boolean connected);
        void onError(String errorMessage);
    }

    private MessageCallback messageCallback;

    public BluetoothConnectionService(Context context, Handler handler, MessageCallback callback) {
        this.context = context;
        this.handler = handler;
        this.messageCallback = callback;
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        state = STATE_NONE;
    }

    public synchronized void connect(BluetoothDevice device) {
        Log.d(TAG, "Conectando: " + device.getName());

        if (state == STATE_CONNECTING || state == STATE_CONNECTED) {
            return;
        }

        cleanupThreads();

        connectThread = new ConnectThread(device);
        connectThread.start();
        setState(STATE_CONNECTING);
    }

    public synchronized void connected(BluetoothSocket socket, BluetoothDevice device) {
        Log.d(TAG, "Conectado: " + device.getName());

        cleanupThreads();

        connectedThread = new ConnectedThread(socket);
        connectedThread.start();

        setState(STATE_CONNECTED);
    }

    public synchronized void stop() {
        Log.d(TAG, "Parando serviço");
        cleanupThreads();
        setState(STATE_NONE);
    }

    private void cleanupThreads() {
        if (connectThread != null) {
            connectThread.cancel();
            connectThread = null;
        }

        if (connectedThread != null) {
            connectedThread.cancel();
            connectedThread = null;
        }
    }

    public void write(String message) {
        if (state != STATE_CONNECTED) {
            Log.e(TAG, "Tentativa de escrever sem conexão");
            if (messageCallback != null) {
                handler.post(() -> messageCallback.onError("Bluetooth não conectado"));
            }
            return;
        }

        if (connectedThread != null) {
            connectedThread.write(message.getBytes());
        }
    }

    private void setState(int newState) {
        state = newState;

        if (messageCallback != null) {
            handler.post(() -> messageCallback.onConnectionStatusChanged(newState == STATE_CONNECTED));
        }
    }

    private class ConnectThread extends Thread {
        private final BluetoothSocket socket;
        private final BluetoothDevice device;

        public ConnectThread(BluetoothDevice device) {
            this.device = device;
            BluetoothSocket tmp = null;

            try {
                tmp = device.createRfcommSocketToServiceRecord(MY_UUID);
            } catch (IOException e) {
                Log.e(TAG, "Falha ao criar socket", e);
            }
            socket = tmp;
        }

        public void run() {
            Log.d(TAG, "Conectando...");

            if (bluetoothAdapter.isDiscovering()) {
                bluetoothAdapter.cancelDiscovery();
            }

            try {
                socket.connect();
                Log.d(TAG, "Conectado com sucesso");
            } catch (IOException e) {
                Log.e(TAG, "Falha na conexão: " + e.getMessage());
                try {
                    socket.close();
                } catch (IOException e2) {
                    Log.e(TAG, "Não foi possível fechar o socket", e2);
                }
                connectionFailed();
                return;
            }

            synchronized (BluetoothConnectionService.this) {
                connectThread = null;
            }

            connected(socket, device);
        }

        public void cancel() {
            try {
                socket.close();
            } catch (IOException e) {
                Log.e(TAG, "Falha ao fechar socket", e);
            }
        }
    }

    private class ConnectedThread extends Thread {
        private final BluetoothSocket socket;
        private final InputStream inputStream;
        private final OutputStream outputStream;
        private boolean running = true;

        public ConnectedThread(BluetoothSocket socket) {
            this.socket = socket;
            InputStream tmpIn = null;
            OutputStream tmpOut = null;

            try {
                tmpIn = socket.getInputStream();
                tmpOut = socket.getOutputStream();
            } catch (IOException e) {
                Log.e(TAG, "Falha ao criar streams", e);
            }

            inputStream = tmpIn;
            outputStream = tmpOut;
        }

        public void run() {
            Log.d(TAG, "Iniciando leitura");
            byte[] buffer = new byte[1024];
            int bytes;

            while (running) {
                try {
                    bytes = inputStream.read(buffer);
                    if (bytes > 0) {
                        String message = new String(buffer, 0, bytes).trim();
                        Log.d(TAG, "Recebido: " + message);

                        if (messageCallback != null && !message.isEmpty()) {
                            handler.post(() -> messageCallback.onMessageReceived(message));
                        }
                    }
                } catch (IOException e) {
                    Log.e(TAG, "Falha na leitura", e);
                    connectionLost();
                    break;
                }
            }
        }

        public void write(byte[] buffer) {
            try {
                outputStream.write(buffer);
                Log.d(TAG, "Dados enviados");
            } catch (IOException e) {
                Log.e(TAG, "Falha ao enviar", e);
            }
        }

        public void cancel() {
            running = false;
            try {
                socket.close();
            } catch (IOException e) {
                Log.e(TAG, "Falha ao fechar socket", e);
            }
        }
    }

    public boolean isConnected() {
        return state == STATE_CONNECTED;
    }

    private void connectionFailed() {
        Log.e(TAG, "Conexão falhou");
        setState(STATE_NONE);
    }

    private void connectionLost() {
        Log.e(TAG, "Conexão perdida");
        setState(STATE_NONE);
    }
}