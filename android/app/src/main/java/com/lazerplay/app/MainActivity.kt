package com.lazerplay.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.BottomAppBar
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            LazerPlayApp()
        }
    }
}

@Composable
fun LazerPlayApp() {
    var isAuthenticated by remember { mutableStateOf(false) }

    MaterialTheme {
        if (!isAuthenticated) {
            AuthScreen(onSuccess = { isAuthenticated = true })
        } else {
            MainContent()
        }
    }
}

@Composable
fun AuthScreen(onSuccess: () -> Unit) {
    var isLogin by remember { mutableStateOf(true) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Text("Lazer Play", fontSize = 28.sp, fontWeight = FontWeight.Bold)
            Text("Streaming de música, vídeos e podcasts", modifier = Modifier.padding(top = 8.dp))

            if (!isLogin) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nome") },
                    modifier = Modifier.fillMaxWidth().padding(top = 16.dp)
                )
            }

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("E-mail") },
                modifier = Modifier.fillMaxWidth().padding(top = 12.dp)
            )

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Senha") },
                modifier = Modifier.fillMaxWidth().padding(top = 12.dp)
            )

            Button(
                onClick = { if (email.isNotBlank() && password.isNotBlank()) onSuccess() },
                modifier = Modifier.fillMaxWidth().padding(top = 16.dp)
            ) {
                Text(if (isLogin) "Entrar" else "Criar conta")
            }

            TextButton(onClick = { isLogin = !isLogin }) {
                Text(if (isLogin) "Criar conta" else "Já tenho conta")
            }

            Text(
                "Demonstração: use qualquer e-mail e senha para entrar.",
                modifier = Modifier.padding(top = 12.dp),
                fontSize = 13.sp,
                color = Color.Gray
            )
        }
    }
}

@Composable
fun MainContent() {
    val tabs = listOf("Início", "Buscar", "Biblioteca", "Perfil")
    var selectedTab by remember { mutableIntStateOf(0) }

    MaterialTheme {
        Scaffold(
            topBar = {
                TopAppBar(title = { Text("Lazer Play") })
            },
            bottomBar = {
                BottomAppBar {
                    tabs.forEachIndexed { index, title ->
                        NavigationBarItem(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index },
                            icon = {
                                Text(if (selectedTab == index) "●" else "○")
                            },
                            label = { Text(title) }
                        )
                    }
                }
            }
        ) { innerPadding ->
            Surface(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                when (selectedTab) {
                    0 -> HomeScreen()
                    1 -> SearchScreen()
                    2 -> LibraryScreen()
                    else -> ProfileScreen()
                }
            }
        }
    }
}

@Composable
fun HomeScreen() {
    val featured = listOf("Nova onda", "Noite tropical", "Acústico indie")
    val playlists = listOf("Para estudar", "Noite", "Podcast mix")

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1D4ED8)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(20.dp)) {
                    Text("Descubra artistas independentes", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    Text("Música, vídeos, podcasts e playlists em um só lugar.", color = Color.White, modifier = Modifier.padding(top = 8.dp))
                }
            }
        }
        item {
            Text("Novos lançamentos", fontWeight = FontWeight.Bold, fontSize = 18.sp)
        }
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(featured) { item ->
                    Card(shape = RoundedCornerShape(16.dp), modifier = Modifier.padding(end = 4.dp)) {
                        Box(modifier = Modifier.padding(16.dp)) {
                            Text(item)
                        }
                    }
                }
            }
        }
        item {
            Text("Playlists recomendadas", fontWeight = FontWeight.Bold, fontSize = 18.sp)
        }
        items(playlists) { title ->
            Card(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .background(Color(0xFFDBEAFE), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Text("♪")
                    }
                    Text(title, modifier = Modifier.padding(start = 12.dp), fontWeight = FontWeight.Medium)
                }
            }
        }
    }
}

@Composable
fun SearchScreen() {
    Column(Modifier.padding(16.dp)) {
        Text("Buscar", fontWeight = FontWeight.Bold, fontSize = 22.sp)
        Text("Música, álbum, artista, playlist ou podcast", modifier = Modifier.padding(top = 8.dp))
    }
}

@Composable
fun LibraryScreen() {
    Column(Modifier.padding(16.dp)) {
        Text("Sua biblioteca", fontWeight = FontWeight.Bold, fontSize = 22.sp)
        Text("Músicas curtidas, downloads, podcasts e artistas seguidos.", modifier = Modifier.padding(top = 8.dp))
    }
}

@Composable
fun ProfileScreen() {
    Column(Modifier.padding(16.dp)) {
        Text("Perfil", fontWeight = FontWeight.Bold, fontSize = 22.sp)
        Text("Gerencie seu perfil, assinaturas e configurações.", modifier = Modifier.padding(top = 8.dp))
    }
}
