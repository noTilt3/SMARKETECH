package com.example.smarketechapp;

import androidx.appcompat.app.AppCompatActivity;
import android.content.Intent;
import android.os.Bundle;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.example.cuidadostitch.R;

public class PreparingOrderActivity extends AppCompatActivity {

    private ProgressBar progressBar;
    private TextView preparingText;
    private int totalItems;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_preparing_order);

        Intent intent = getIntent();
        int[] quantities = intent.getIntArrayExtra("quantities");
        totalItems = intent.getIntExtra("totalItems", 0);

        preparingText = findViewById(R.id.preparing_text);
        progressBar = findViewById(R.id.progress_bar);

        preparingText.setText("Preparando seu pedido de " + totalItems + " itens...");
        progressBar.setMax(totalItems);
        progressBar.setProgress(0);
    }
}