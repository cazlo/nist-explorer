package com.easydynamics.oscalrestservice.api;

import com.easydynamics.oscalrestservice.exception.RecordNotFoundException;
import com.easydynamics.oscalrestservice.model.OscalParty;
import com.easydynamics.oscalrestservice.repository.PartyRepository;
import io.swagger.v3.oas.annotations.Parameter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Party Controller for OSCAL REST Service.
 */

@RequestMapping(path = "/oscal/v1")
@RestController
public class PartyController {

  @Autowired
  private PartyRepository repository;

  @Autowired
  private Environment env;

  /**
   * Defines a GET request to return all parties.
   *
   * @return all parties
   */

  @GetMapping("/parties")
  public ResponseEntity<List<OscalParty>> findAllParties() {

    return new ResponseEntity<>(repository.findAll(), HttpStatus.OK);
  }

  /**
   * Defines a GET request for party by ID.
   *
   * @param id the party uuid.
   * @return the party simple object
   */

  @GetMapping("/parties/{id}")
  public ResponseEntity<OscalParty> findById(@Parameter @PathVariable String id) {
    OscalParty party = repository.findByUuid(id).orElseThrow(
        () -> new RecordNotFoundException("Error, Party with specified UUID not found"));
    return new ResponseEntity<OscalParty>(party, HttpStatus.OK);
  }

  /**
   * Defines a GET request for party by name.
   *
   * @param name the party name.
   * @return the party simple object
   */

  @GetMapping("/parties/search")
  public ResponseEntity<List<OscalParty>> findPartyByName(@RequestParam String name) {

    List<OscalParty> results = repository.findByName(name);
    System.out.println(results);
    return new ResponseEntity<>(results, HttpStatus.OK);
  }

  /**
   * Defines a POST request to create a new party.
   *
   * @return the party simple object
   */

  @PostMapping("/parties")
  public ResponseEntity<OscalParty> addParty(@Valid @RequestBody OscalParty party) {

    repository.save(party);
    return new ResponseEntity<OscalParty>(party, HttpStatus.CREATED);
  }

  /**
   * Defines a GET request for a party via an environment variable.
   *
   * @param partyLocalJson the environment variable representing the local
   *                       components file
   * @return the oscal content of the local components json file
   */
  @GetMapping("/parties/env/{partyLocalJson}")
  public ResponseEntity<String> findByLocalEnv(@Parameter @PathVariable String partyLocalJson) {
    String fileName = env.getProperty(partyLocalJson);
    if (fileName == null) {
      return new ResponseEntity<String>("partyLocalJson is not an environemnt variable.", 
        HttpStatus.NOT_FOUND);
    }
    String contents;
    try {
      contents = Files.readString(Path.of(fileName));
    } catch (IOException e) {
      return new ResponseEntity<String>("Party file does not exist locally.", HttpStatus.NOT_FOUND);
    }

    return new ResponseEntity<String>(contents, HttpStatus.OK);
  }
}
