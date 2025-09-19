package com.example.cuidadostitch;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import java.text.NumberFormat;
import java.util.Locale;

public class CartActivity extends AppCompatActivity {

    private int[] quantities;
    private double[] prices;
    private String[] itemNames;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_cart);

        Intent intent = getIntent();
        quantities = intent.getIntArrayExtra("quantities");
        prices = intent.getDoubleArrayExtra("prices");
        itemNames = intent.getStringArrayExtra("itemNames");

        setupUI();
    }

    private void setupUI() {
        TextView itemsList = findViewById(R.id.items_list);
        TextView totalPrice = findViewById(R.id.total_price);
        Button finishButton = findViewById(R.id.finish_button);

        StringBuilder itemsText = new StringBuilder();
        double total = 0;
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));

        boolean hasItems = false;

        for (int i = 0; i < quantities.length; i++) {
            if (quantities[i] > 0) {
                hasItems = true;
                double itemTotal = quantities[i] * prices[i];
                itemsText.append(quantities[i])
                        .append("x ")
                        .append(itemNames[i])
                        .append(" - ")
                        .append(currencyFormat.format(itemTotal))
                        .append("\n\n");
                total += itemTotal;
            }
        }

        if (!hasItems) {
            itemsText.append("Nenhum item no carrinho");
            finishButton.setEnabled(false);
            finishButton.setAlpha(0.5f);
        }

        itemsList.setText(itemsText.toString());
        totalPrice.setText(currencyFormat.format(total));

        finishButton.setOnClickListener(v -> finishOrder());
    }

    private void finishOrder() {
        int totalItems = quantities[0] + quantities[1] + quantities[2];
        if (totalItems == 0) {
            Toast.makeText(this, "Adicione itens ao pedido primeiro", Toast.LENGTH_SHORT).show();
            return;
        }

        // Retornar para MainActivity com a instrução de enviar o comando
        Intent resultIntent = new Intent();
        resultIntent.putExtra("shouldSendCommand", true);
        resultIntent.putExtra("quantities", quantities);
        setResult(RESULT_OK, resultIntent);
        finish();
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        // Voltar para a tela principal sem enviar comando
        Intent intent = new Intent();
        intent.putExtra("shouldSendCommand", false);
        intent.putExtra("quantities", quantities);
        setResult(RESULT_OK, intent);
        finish();
    }
}